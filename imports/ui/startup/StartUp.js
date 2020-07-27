/**
 * /imports/ui/startup/StartUp.js
 */


import { Session } from 'meteor/session'

// Helpers
import { removeFrom
       , getRandomFromArray
       } from '../../tools/generic/utilities'
import Storage from '../../tools/generic/storage'

// Subscriptions
import collections from '../../api/collections/publisher'

//
import { methods } from '../../api/methods/mint'
const { logIn } = methods



// window.collections = collections


export default class StartUp {
  constructor(preloadComplete) {
    this.preloadComplete = preloadComplete

    /// <<< HARD-CODED
    const timeOutDelay = 10 * 1000 // 500 ms is enough in development
    const splashDelay = 1 // 000 // min time (ms) to show Splash screen

    this.hack = window.location.pathname.startsWith("/*")
    /// HARD-CODED >>>

    this.ready = this.ready.bind(this)
    this.hideSplash = this.hideSplash.bind(this)
    this.callback = this.callback.bind(this)
    // this.groupsCallback = this.groupsCallback.bind(this)
    this.connectionTimedOut = this.connectionTimedOut.bind(this)

    // Loading takes about 250ms when running locally
    this.timeOut = setTimeout(this.connectionTimedOut, timeOutDelay)

    this.prepareSplash(splashDelay)
    // Will trigger setViewSize when all is ready
  }


  prepareSplash(splashDelay) {
    this.showSplash  = + new Date() + splashDelay
    this.unReady = []
    this.subscriptions = {}

    this.connectToMongoDB() // calls ready => setViewSize when ready
  }


  connectToMongoDB() {
    for (let collectionName in collections) {
      this.unReady.push(collectionName)

      const collection = collections[collectionName]
      // We can send (multiple) argument(s) to the server publisher
      // for debugging purposes
      const callback = () => this.ready(collectionName, "Share")
      const handle   = Meteor.subscribe(collection._name, callback)
      this.subscriptions[collectionName] = handle
    }
  }


  ready(collectionName) {
    removeFrom(this.unReady, collectionName)

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
    this.setSessionData()
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
        // console.log("prepareApp => reJoinGroups")
        this.reJoinGroups()
      break

      default:
        this.go = { view: "Profile" }
        this.hideSplash()
    }
  }


  setSessionData() {
    // console.log("setSessionData")

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


  setSessionDataFrom(storedData, keys) {
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


  sessionSetD_code() {
    let d_code    = ""
    const source = "0123456789&#"
                 + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                 + "abcdefghijklmnopqrstuvwxyz"
    const length = source.length
    const total  = 7 // Creates 4 398 046 511 104 possible strings
    for ( let ii = 0; ii < total; ii += 1 ) {
      d_code += getRandomFromArray(source)
    }

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
    this.preloadComplete(this.go)
  }
}
