/**
 * /imports/ui/startup/StartUp.js
 */


import { Session } from 'meteor/session'

// Helpers
import { removeFrom
       , getRandom
       , getRandomFromArray
       } from '../../tools/generic/utilities'
import Storage from '../../tools/generic/storage'

// Subscriptions
import collections from '../../api/collections/publisher'

// Methods
import { methods } from '../../api/methods/mint'
const { logIn } = methods

// Constant
import { STARTUP_TIMEOUT } from '/imports/tools/custom/constants'



export default class StartUp {
  constructor(preloadComplete) {
    this.preloadComplete = preloadComplete

    /// <<< HARD-CODED
    const splashDelay = 1 // 000 // min time (ms) to show Splash screen
    this.hack = window.location.pathname.startsWith("/*")
    /// HARD-CODED >>>

    this.ready = this.ready.bind(this)
    this.goSolo = this.goSolo.bind(this)
    this.hideSplash = this.hideSplash.bind(this)
    this.callback = this.callback.bind(this)
    this.connectionTimedOut = this.connectionTimedOut.bind(this)

    // Loading takes about 250ms when running locally
    this.timeOut = setTimeout(this.connectionTimedOut,STARTUP_TIMEOUT)

    this.prepareSplash(splashDelay)
    // Will trigger setViewSize when all is ready
  }


  prepareSplash(splashDelay) {
    this.showSplash  = + new Date() + splashDelay
    this.unReady = []

    this.connectToMongoDB() // calls ready => setViewSize when ready
  }


  connectToMongoDB() {
    for (let collectionName in collections) {
      this.unReady.push(collectionName)

      const collection = collections[collectionName]
      // We can send (multiple) argument(s) to the server publisher
      // for debugging purposes
      // console.log("Subscribing to", collection._name)

      const callback = () => this.ready(collectionName, "Share")
      const handle   = Meteor.subscribe(collection._name, callback)
    }
  }


  ready(collectionName) {
    removeFrom(this.unReady, collectionName)

    // console.log("Collection is ready:", collectionName)

    if (!this.unReady.length) {
      if (this.timeOut) {
        // Leave this.timeOut as a non-zero value
        clearTimeout(this.timeOut)
        this.prepareApp()
      }
    }
  }


  connectionTimedOut() {
    this.timeOut = 0 // this.prepareConnection will not run now

    this.preloadComplete("TimeOut")
  }


  // CONNECTION SUCCESSFUL // CONNECTION // SUCCESSFUL CONNECTION //


  /** MongoDB is ready: use it to check which view to show
   *
   *  Four cases:
   *  1. New user
   *  2. Returning user
   *  3. Teacher
   *  4. Admin
   *
   *  A new user needs to go down the native, name, teacher path
   *  Returning user:
   *    • (When menu is available or if * is in path), resume
   *    • Until menu is available, review profile
   *  A teacher:
   *    • Rejoin a group that was active and which still has a student
   *    • Go to Teach if not
   *  Admin: TBD
   */
  prepareApp() {
    const goingSolo = this.setSessionData()
    if (goingSolo) {
      return
    }

    // First time user: no Session data
    // Returning user:  user_id is set
    // Teacher:         teacher_id is set

    switch (Session.get("role")) {
      case "admin":
      // TODO
      break

      case "teacher":
        this.checkForActiveGroup()
      break

      case "user":
        this.reJoinGroups()
      break

      default:
        this.go = { view: "Profile" }
        this.hideSplash()
    }
  }


  setSessionData() {
    // console.log("setSessionData")
    const goSolo = this.getURLQueryData()
    if (goSolo) {
      return true
    }

    const storedData = Storage.get()
    // console.log("storedData:", storedData)
    // auto_login:  false
    // group_id:    "naRRNbnrr2syzEhPz"
    // language:    "ru"
    // native:      "en-GB"
    // q_code:      "3819"
    // q_color:     "#33cc60"
    // restore_all: false
    // teacher:     "aa"
    // user_id:     "H9uMqxwvkySYt7QtP"
    // username:    "James"
    // view:        "Activity"

    const keys = Object.keys(storedData)
    const teacher = this.checkURLForTeacherName()
    // TODO: Add test for admin

    this.sessionSetD_code()

    if (teacher) {
      Session.set("teacher_id", teacher.id)
      Session.set("native",     teacher.language)
      Session.set("language",   teacher.language)
      Session.set("role",       "teacher")
      Session.set("q_color",    "#f00") // red by default for Teachers
      // d_code, q_code, q_color

    } else if (keys.length) {
      Session.set("role", "user")
      this.setSessionDataFrom(storedData, keys)

    } else {
      // First time user on this device. No storedData to treat
    }

    return false
  }


  getURLQueryData() {
    const searchParams = new URLSearchParams(window.location.search)

    // Check if the URL includes a "solo" parameter, regardless of its
    // value. If so, we will create a temporary user with a user_id
    // like "deleteTempUser_EsWSkLZh9bGMbLpZf", which will be deleted
    // when the user logs out.
    const goSolo = (searchParams.has("solo"))
    if (!goSolo) {
      return false
    }

    const username = "deleteTempUser_" + this.getRandomString(9)
    const d_code = this.getRandomString(7)

    const accountData = {
      d_code
    , username
    , restore_all: true
    , language:   searchParams.get("language") || "en-GB"
    , native:     searchParams.get(".native") || "en-GB"
    , teacher:    "none"
    }

    logIn.call(accountData, this.goSolo)

    return true
  }


  goSolo(error, result) {
    // console.log("goSolo (error:", error, ") data:", result)
    // username: "deleteTempUser_8fbkqvueP"
    // user_id: "qbK7SjzunhotN6nK3"
    // d_code: "fenalUI"
    // group_id: "8B8B6eLFoPEF2vT8q"
    //
    // q_code: "5278"
    // q_color: "#33b2cc"
    // teacher: "none"
    //   page: {view: "Activity"}
    // restore_all: true
    //
    //   accountCreated: true
    //   groupCreated: true
    //   loggedIn: true
    //   status: "JoinGroup_success"

    delete result.accountCreated
    delete result.groupCreated
    delete result.loggedIn
    delete result.status
    delete result.page

    // native:      "en-GB"
    //   username:    "James"
    // language:    "ru"
    //   teacher:     "aa"
    //   q_code:      "3819"
    //   q_color:     "#33cc60"
    //   user_id:     "6oRFpNLZEfkN4HfMj"
    //   group_id:    "4Bd5yhRfstZ77zxAZ"
    // view:        "Drag"
    // auto_login:  false
    // restore_all: false

    const searchParams = new URLSearchParams(window.location.search)
    searchParams.delete("solo")

    const data = {}
    searchParams.forEach(function(value, key) {
      data[key] = value
    })

    // console.log("params:", JSON.stringify(data, null, "  "))
    // {
    // "path": "Show/OatsAndBeans",
    // "tag": "oatsAndBeans",
    // "index": "2",
    //
    // "slideIndex": "5",
    // "menu_open": "false",
    //
    // "native": "en",
    // "language": "en",
    // }

    result.native = data.native
    result.language = data.language
    result.auto_login = true // <<< HARD-CODED

    delete data.native
    delete data.language

    this.setSessionDataFrom(result)

    for (const key in data) {
      let value = data[key]
      if (!isNaN(value)) {
        data[key] = parseInt(value, 10)
      }
    }

    const { path, index, tag } = data
    delete data.path
    delete data.index
    delete data.tag

    if(!path) {
      this.go = { view: "Activity" }
    } else {
      const page = { path, tag, index, data }
      this.go = page
    }

    this.hideSplash()
  }


  checkURLForTeacherName() {
    // http://activities.jazyx.com/<teacher_id>
    // http://activities.jazyx.com/?teacher=<teacher_id>

    let id = window.location.getParameter("teacher")
    if (!id) {
      id = window.location.pathname.substring(1) // /id => id
    }
    let teacher = this.getTeacher(id)

    if (!teacher) {
      const search = window.location.search.toLowerCase()
      id = new URLSearchParams(search).get("teacher")
      if (id) {
        teacher = this.getTeacher(id)
      }
    }

    return teacher // may be undefined
  }


  getTeacher(id) {
    id = decodeURI(id)
         .replace(/^аа$/, "aa") // Russian а to Latin a for Настя
    return collections.Teacher.findOne({ id })
  }


  setSessionDataFrom(storedData) { //, keys) {
    // native:      "en-GB"
    // username:    "James"
    // language:    "ru"
    // teacher:     "aa"
    // q_code:      "3819"
    // q_color:     "#33cc60"
    // user_id:     "6oRFpNLZEfkN4HfMj"
    // group_id:    "4Bd5yhRfstZ77zxAZ"
    // view:        "Drag"
    // auto_login:  false
    // restore_all: false

    for (let key in storedData) {
      Session.set(key, storedData[key])
    }

    /// <<< TEMPORARY HACK UNTIL MENU IS WORKING
    const auto_login  = storedData.auto_login || this.hack
    const restore_all = storedData.restore_all || this.hack
    Session.set("auto_login", auto_login)
    Session.set("restore_all", restore_all)
    /// TEMPORARY HACK >>>

    if (!auto_login) {
      Session.set("group_id", undefined)
      delete Session.keys.group_id
    }
  }


  getRandomString(length) {
    let randomString = ""
    const source = "0123456789&#"
                 + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                 + "abcdefghijklmnopqrstuvwxyz"
    for ( let ii = 0; ii < length; ii += 1 ) {
      randomString += getRandomFromArray(source)
    }

    return randomString
  }


  sessionSetD_code() {
    const length = 7 // Creates 4 398 046 511 104 possible strings
    const d_code = this.getRandomString(length)

    Session.set("d_code", d_code)
  }


  /** Check if the connection just broke and if so, log back in
   *  to the shared group. Otherwise, go to the Teach view.
   */
  checkForActiveGroup() {
    // TODO: Integrate menu then remove the following 2 lines
    this.go = { view: "Teach" }
    return this.hideSplash()
  }


  reJoinGroups() {
    // TODO: Integrate menu then remove the following 4 lines
    if (!Session.get("auto_login")) {
      // console.log("reJoinGroups Returning user:", Session.get("username"))
      this.go = { view: "Profile" }
      return this.hideSplash()
    }

    // Log in automatically
    const accountData = {
      d_code:      Session.get("d_code")
    , username:    Session.get("username")
    , q_code:      Session.get("q_code")
    , group_id:    Session.get("group_id")
    , restore_all: Session.get("restore_all")
    }

    logIn.call(accountData, this.callback)
  }


  callback(error, data) {
    Session.set("isMaster", data.isMaster || false)
    const page = data.page || {}
    this.go = page
    this.hideSplash()
  }


  hideSplash() {
    // console.log("hideSplash — this.timeOut", this.timeOut)
    if (+ new Date() < this.showSplash) {
      // console.log("Polling for", this.showSplash, "in", this.showSplash - + new Date())
      return setTimeout(this.hideSplash, 100)
    }

    if (!this.timeOut) {
      // connectionTimedOut was triggered, and the TimeOut screen is
      // showing.
      // TODO: Provide three buttons on the TimeOut screen:
      // * Reload
      // * Wait
      // * Continue
      // Continue will be disabled until this method is called. When
      // it becomes enabled, it will jump to the view store in Groups.
      return this.preloadComplete({ view: "TimeOut" })
    }

    this.showSplash = 0

    // console.log("Hide splash and go", this.go)

    // Tell Share to replace the Splash screen will with an
    // interactive view (Profile, Activity or an activity-in-progress)

    // console.log("StartUp preloadComplete(\"" + this.go + "\")")

    //////////////////// ADD group_id???///////////////////////
    this.preloadComplete(this.go, Session.get("group_id"))
  }
}
