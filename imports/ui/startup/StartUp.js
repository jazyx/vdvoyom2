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
    this.oneOff = this.oneOff.bind(this)
    this.hideSplash = this.hideSplash.bind(this)
    this.loggedInToGroups = this.loggedInToGroups.bind(this)
    this.connectionTimedOut = this.connectionTimedOut.bind(this)
    this.welcomeNewUser = this.welcomeNewUser.bind(this)

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
    const query = new URLSearchParams(window.location.search)

    // Check if the URL includes a "once" parameter, regardless of its
    // value. If so, we will create a temporary user with a user_id
    // like "deleteTempUser_EsWSkLZh9bGMbLpZf", which will be deleted
    // when the user logs out.
    if (query.has("once")) {
      this.autoLogIn(query, "singleUse", this.oneOff)

    } else if (query.has("join")) {
      this.treatUserInvitation(query, false, this.welcomeNewUser)

    } else {
      const teacher = this.getTeacherFromURL(query) //may be undefined

      this.setSessionDataFromStorage(teacher)
      // TODO: Add test for admin
      this.prepareUIForRole()
    }
  }


  prepareUIForRole() {
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


  /** Called by prepareApp()
   *
   * @param  {object}  teacher  undefined OR
   *                            {"_id" :       <string>,
   *                              "file" :     <image filename>,
   *                              "id" :       <string>,
   *                              "name" : {
   *                                "cyrl" :   <string>,
   *                                "latn" :   <string>
   *                              },
   *                              "with" :     <"learn x with Y">,
   *                              "language" : <ISO code string,
   *                              "script" :   <one of name keys>,
   *                              "type" :     "profile",
   *                              "version" :  <integer (irrelevant)>,
   *                              "logged_in" : [ ... ]
   *                            }
   */
  setSessionDataFromStorage(teacher) {
    const storedData = Storage.get()

    // console.log(
    //   "storedData"
    // , JSON.stringify(storedData, null, "  ")
    // )
    /* { username:    "James"
     * , user_id:     "H9uMqxwvkySYt7QtP"
     * , native:      "en-GB"
     * , teacher:     "aa"
     * , language:    "ru"
     * , group_id:    "naRRNbnrr2syzEhPz"
     * , q_code:      "3819"
     * , q_color:     "#33cc60"
     * , restore_all: false
     * , "auto_login":false
     *
     * [, view:       "Activity"]
     * }
     */

    const keys = Object.keys(storedData)

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
      this.setSessionDataFrom(storedData)

    } else {
      // First time user on this device. No storedData to treat
    }
  }


  /** Prepares accountData for a call to logIn method, with callback
   *
   * Called by prepareApp() if window.location.search includes "once"
   * and by treatUserInvitation if ~.search includes "join"
   *
   * @param  {URLSearchParams}  query      instance with properties
   *                                       * user (username)
   *                                       * own  (teacher id)
   *                                       * vo   (native)
   *                                       * lang (language)
   * @param  {truthy}           singleUse  true if the User and Group
   *                                       documents are to be deleted
   *                                       when this session ends.
   * @param  {Function}         callback   Function to call after the
   *                                       logIn method has run
   */
  autoLogIn(query, singleUse, callback) {
    let username = query.get("user")

    if (singleUse) {
      const nonce = username || this.getRandomString(9)
      username = "deleteTempUser_" + nonce
    }

    const d_code   = this.sessionSetD_code()
    const teacher  = query.get("own") || "none"
    const q_code   = query.get("pin")
    const language = query.get("lang") || "en-GB"
    const native   = query.get("vo")
                  || navigator.language
                  || navigator.userLanguage

    const accountData = {
      d_code
    , q_code
    , username
    , teacher
    , restore_all: true
    , language
    , native
    }

    logIn.call(accountData, callback)
  }


  oneOff(error, result) {
    console.log(
      "oneOff (error:", error
    , ") result:", JSON.stringify(result, null, "  ")
    )
    //
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

    let page = result.page // { view: "Activity" }

    const data = this.getParamsFromURL({ without: ["once"] })

    // console.log("data:", JSON.stringify(data, null, "  "))
    // {
    // "path": "Show/OatsAndBeans",
    // "tag":   "oatsAndBeans",
    // "index": "2",
    //
    // "slideIndex":  "5",
    // "menu_open": "false",
    //
    // "native":   "en",
    // "language": "en",
    // }

    this.mergeParamsAndAccountData(result, data, page)
  }


  /**
   * result = account data
   * data   = url params
   * page   = default { view: "Activity" }
   */
  mergeParamsAndAccountData(result, data, page, ignorePath) {
    result.native     = data.vo
    result.language   = data.lang
    result.auto_login = true // <<< HARD-CODED

    delete data.vo
    delete data.own
    delete data.lang

    this.setSessionDataFrom(result) // unnecessary keys ignored

    // Convert numerical params from strings to numbers
    for (const key in data) {
      let value = data[key]
      if (!isNaN(value)) {
        data[key] = parseInt(value, 10)
      }
    }

    // Extract expected keys; the rest will be treated as 'data'
    let { view, path, index, tag } = data
    delete data.view
    delete data.path
    delete data.index
    delete data.tag

    if(!path || ignorePath) {
      // Leave page unchanged

    } else {
      // Ensure path begins with a slash
      if (path[0] !== "/") {
        path = "/" + path
      }

      // Ensure that path (if given) starts with a collection name
      let levels = path.split("/")
      const collectionName = levels[1]
      if (!collections[collectionName]) {
        // Leave page unchanged

      } else {
        let lastIndex = levels.length - 1

        // <<< HACK to ensure that all levels are shown in the menu
        // ASSUMES:
        // • path is complete except for the last item
        // • the tag is the same as the last item should be, except
        //   that the first char is in lowercase
        if (tag)
          if (levels[lastIndex].toLowerCase() !== tag.toLowerCase()) {
          levels.push(tag[0].toUpperCase() + tag.substring(1))
          path = levels.join("/")
          lastIndex += 1
        }
        // HACK >>>

        if (isNaN(index) || index > lastIndex || index < 0) {
          index = lastIndex
        }

        page = { path, tag, index, data }
      }
    }

    this.go = page
    this.hideSplash()
  }


  /** Create a new user link+query to define name, teacher and task
   *
   * @param  {URLSearchParams}  query   Can define:
   *                                    user (username)
   *                                    vo   (native)
   *                                    own  (teacher + language)
   *                                   ~pin~~(q_code)~
   *                                    [page]
   *                                      view
   *                                      path
   *                                      index
   *                                      [data]
   * user, vo, own, view, path and index are treated specifically,
   * with view, path and index being placed inside a `page` object.
   * All other key/value pairs are treated as belonging to the
   * `page.data` object. If no view or path is given, `page` will
   * be set to { view: "Activity" } and any data pairs will be
   * ignored.
   *
   * The visitor will be taken through the Profile pages, step by
   * step, with any submitted details already filled in. If a pin-free
   * URL is used more than once, the visitor will be asked to provide
   * the PIN before continuing.
   */
  treatUserInvitation(query) {
    const params = this.getParamsFromURL({ query })
    const { user, vo, own, pin } = params

    if ( user && vo && own && pin ) {
      const callback = this.welcomeNewUser
      const isSingleUse = false
      const loggedIn  = this.autoLogIn(query, isSingleUse, callback )

    } else {
      // At least one property is missing for autoLogIn. Step through
      // Profile screens with given presets


    }
  }


  welcomeNewUser(error, result) {
    if (error) {
      return console.log("welcomeNewUser error:", error)
    }

    // console.log(
    //   "welcomeNewUser error:", error,
    //   "result:", JSON.stringify(result, null, "  ")
    // )
    /* {"d_code": "qvyOJ3g",
     *  "q_code": "1459",
     *  "username": "ele",
     *  "group_id": "6ZTtdSw4kofaDYutN",
     *  "teacher": "jn",
     *    "restore_all": true,
     *    "language": "en-GB",
     *  "native": "en",
     *  "user_id": "t5H3s8nvWMhbYTbqG",
     *  "q_color": "#ccb933",

     *  "page": {
     *    "path": "/Show/OatsAndBeans",
     *    "tag": "oatsAndBeans",
     *    "index": 2,
     *    "data": {
     *      "menu_open": false
     *    }
     *
     *  "status": "JoinGroup_success",
     *  "loggedIn": true,
     *  }
     */

    let page = result.page // likely to change
    let ignorePath = false

    if (!result.loggedIn) {
      // `pin` was defined and used for d_code, but it was wrong.
      page = this.manualLoginAfterAutoLoginFailed(result)
      ignorePath = true
      if (!page) {
        return console.log("NO PAGE FOUND IN STARTUP")
      }
    }

    const without = [ "join", "user", "own", "pin" ]
    const data = this.getParamsFromURL({ without })
    // console.log("welcomeNewUser data:", data)
    // { vo
    // , lang
    // , view
    // , path
    // , index
    // , [data]
    // }

    this.mergeParamsAndAccountData(result, data, page, ignorePath)
  }


  manualLoginAfterAutoLoginFailed(data) {
    switch (data.status) {
      case "RequestPIN":
        return { view: "Submit" }
      break
      default:
        console.log(
          "manualLoginAfterAutoLoginFailed status:", data.status
        , "data" , JSON.stringify(data, null, "  ")
        )

    }
  }


  getParamsFromURL({
    query = new URLSearchParams(window.location.search)
  , without = []
  }) {

    without.forEach( item => {
      query.delete(item)
    })

    const data = {}
    query.forEach(function(value, key) {
      data[key] = value
    })

    return data
  }


  /** Checks for a search parameter or a shortcut teacher id
   *
   *    http://activities.jazyx.com/?teacher=<teacher_id>
   * OR http://activities.jazyx.com/<teacher_id>
   *
   * If a shortcut is used, no other data will be found in the URL
   *
   * Returns undefined or an object with the format:
   *  {
   *    "_id" : "MQoQa3MsixrkjgLWg",
   *    "file" : "aa.jpg",
   *    "id" : "aa",
   *    "name" : {
   *      "cyrl" : "Анастасия",
   *      "latn" : "Anastacia"
   *    },
   *    "with" : "Учить русский с Анастасией",
   *    "language" : "ru",
   *    "script" : "cyrl",
   *    "type" : "profile",
   *    "version" : 4,
   *    "logged_in" : [
   *      "JSQTk6f"
   *    ]
   *  }
   */
  getTeacherFromURL(query) {
    // Look for a "? ... &teacher=XX" search entry first
    let id = query.get("teacher")

    if (!id) {
      // Look for a "/XX" shortcut second
      id = window.location.pathname.substring(1) // /id => id
    }

    let teacher = this.getTeacher(id)

    // // Really desperate: check for "tEAchEr" case-insensitively
    // if (!teacher) {
    //   const search = window.location.search.toLowerCase()
    //   id = new URLSearchParams(search).get("teacher")
    //   if (id) {
    //     teacher = this.getTeacher(id)
    //   }
    // }

    return teacher // may be undefined
  }


  getTeacher(id) {
    id = decodeURI(id)
         .replace(/^аа$/i, "aa") // Russian а to Latin a for Настя
    return collections.Teacher.findOne({ id })
  }


  /**
   * Called by setSessionDataFromStorage(), oneOff()
   *
   * @param      {<type>}  error   The error
   */
  setSessionDataFrom(data) { //, keys) {
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

    const keys = [
      "username"
    , "user_id"
    , "native"
    , "teacher"
    , "language"
    , "q_code"
    , "q_color"
    , "group_id"
    , "view"        // WHY NOT JUST PAGE?
    , "page"
    , "auto_login"
    , "restore_all"
    ]

    keys.forEach( key => {
      Session.set(key, data[key])
    })

    /// <<< TEMPORARY HACK UNTIL MENU IS WORKING
    const auto_login  = data.auto_login || this.hack
    const restore_all = data.restore_all || this.hack
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

    return d_code
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

    logIn.call(accountData, this.loggedInToGroups)
  }


  loggedInToGroups(error, data) {
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
