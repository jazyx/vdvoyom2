/**
 * /imports/ui/startup/StartUp.js
 */


import { Session } from 'meteor/session'

// Helpers
import { removeFrom
       , deleteFrom
       , getRandom
       , getRandomFromArray
       } from '../../tools/generic/utilities'
import Storage from '../../tools/generic/storage'

// Subscriptions
import collections from '../../api/collections/publisher'

// Connection
import { preloadCollections } from './PreloadCollections'

// Methods
import { methods } from '../../api/methods/mint'
const { logIn } = methods

// Constant
import { SPLASH_DELAY
       , STARTUP_TIMEOUT
       } from '/imports/tools/custom/constants'



export default class StartUp {
  constructor(preloadComplete) {
    /// <<< HARD-CODED
    this.hack = window.location.pathname.startsWith("/*")
    /// HARD-CODED >>>

    this.preloadComplete = preloadComplete
    this.showSplash  = + new Date() + SPLASH_DELAY

    this.oneOff = this.oneOff.bind(this)

    preloadCollections.then(this.prepareLaunch.bind(this))
                      .catch(preloadComplete) // shows "TimeOut"
    // preloadCollections is a promise, so it is guaranteed to be
    // asynchronous. The next command _will_ be executed before
    // prepareLaunch or preloadComplete is called.

    this.readInPresets()
  }

  ///// DETERMINE this.context, this.accountData AND this.page //////

  readInPresets() {
    this.readDataFromURL() // sets this.accountData
                           //      this.page
                           //      this.context
    if (this.context === "check") {
      // The window.location.path may be a teacher id shortcut,
      // or their may be no presets in the URL at all.
    }
  }


  readDataFromURL() {
    const search  = window.location.search
    const query   = new URLSearchParams(search)
    this.setContext(query)
                 // once | join | admin | teacher | bare

    const data = {}
    query.forEach(function(value, key) {
      data[key] = value
    })

    this.setAccountDataAndPage(data)
  }


  setContext(query) {
    this.context = query.has("once")
                  ? "once"
                  : query.has("join")
                    ? "join"
                    : query.has("admin")
                      ? "admin"
                      : query.has("teacher")
                        ? "teacher"
                        : "check" // plain user or shortcut teacher
  }


  setAccountDataAndPage(data) {
    const {
      // login
      user: username
    , vo:   native
    , own:  teacher
    , pin:  q_code
      // page
    , view
    , path
    , tag
    , index
    } = data

    // Reduce `data` to just those entries that are not spoken for
    const notPageDataKeys = [
      "user"
    , "vo"
    , "own"

    , "pin"
    , "view"
    , "path"
    , "tag"
    , "index"

    , "join"
    , "once"
    ]
    deleteFrom(data, notPageDataKeys)

    // Ignore data if it contains none
    if (!Object.keys(data).length) {
      data = undefined
    }

    const trim = (key, value) => value === undefined

    // this.accountData will be an object, but it may be empty
    const accountData = { username, native, teacher, q_code }
    deleteFrom(accountData, trim)
    this.accountData = this.normalizeAccountData(accountData)

    // If neither view or path is given, this.page will be undefined
    const page ={ view, path, tag, index, data }
    deleteFrom(page, trim)
    this.page = this.normalizePage(page) // may be undefined
  }


  normalizePage(page) {
    if (!page.view && !page.path) {
      return
    }

    let { path, view, tag, index } = page

    if (typeof path === "string") {
      // Ensure path begins with a slash
      if (path[0] !== "/") {
        path = "/" + path
      }

      // Ensure that path (if given) starts with a collection name
      let levels = path.split("/")
      const collectionName = levels[1]

      if (!collections[collectionName]) {
        // path (and thus tag and index) are invalid
        if (typeof view !== "string") {
          return // entire page is invalid if view is not a string
        }

        // Remove unusable properties
        deleteFrom(page, ["path", "tag", "index", "data"])

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
          page.index = lastIndex
        }
      }

      page.path = path
    }

    return page
  }


  normalizeAccountData(accountData) {
    console.log(
      "accountData"
    , JSON.stringify(accountData, null, "  ")
    )

    if (this.context === "once") {
      const nonce = accountData.username || this.getRandomString(9)
      accountData.username = "deleteTempUser_" + nonce
      // accountData.restore_all = true
    }

    const defaultValues = {
      d_code:      this.sessionSetD_code()
    , teacher:     "none"
    , language:    "en-GB"
    , native:      navigator.language || navigator.userLanguage
    , restore_all: false
    }

    accountData = Object.assign(defaultValues, accountData)

    return accountData
  }

  ///// MongoDB COLLECTIONS ARE NOW AVAILABLE. LOGIN CAN HAPPEN /////

  prepareLaunch() {
    console.log("prepareLaunch")
    switch (this.context) {
      case "once":
        return this.autoLogIn(this.accountData, "once", this.oneOff)
      case "join":
        return this.treatUserInvitation(query, false, this.welcomeNewUser)
      case "admin":
        return this.treatAdmin(user)
      case "teacher":
        return this.getTeacherFromURL(query) //may be undefined
      default:


      // this.setSessionDataFromStorage(teacher)
      // // TODO: Add test for admin
      // this.prepareUIForRole()
    }
  }


  /* Prepares accountData for a call to logIn method, with callback
   *
   * Called by:
   * • prepareApp() if window.location.search includes "once"
   * •treatUserInvitation if         ~.search includes "join"
   *
   * @param  {URLSearchParams}  accountData { username
   *                                        , native
   *                                        , teacher
   *                                        , language
   *                                        , restore_all
   *                                        }
   * @param  {truthy}           singleUse  true if the User and Group
   *                                       documents are to be deleted
   *                                       when this session ends.
   * @param  {Function}         callback   Function to call after the
   *                                       logIn method has run
   */
  autoLogIn(accountData, singleUse, callback) {
    if (typeof singleUse === "function") {
      // Allow singleUse to be omitted
      callback = singleUse
      singleUse = false

    } else if (singleUse) {
      const nonce = accountData.username || this.getRandomString(9)
      accountData.username = "deleteTempUser_" + nonce
    }

    const defaultValues = {
      d_code:      this.getRandomString(7)
    , teacher:     "none"
    , language:    "en-GB"
    , native:      navigator.language || navigator.userLanguage
    , restore_all: false
    }

    accountData = Object.assign(defaultValues, accountData)

    // this.setSessionDataFrom(accountData)

    logIn.call(accountData, callback)
  }


  oneOff(error, result) {
    console.log(
      "oneOff (error:", error
    , ") result:", JSON.stringify(result, null, "  ")
    )
    console.log(
      "this.page"
    , JSON.stringify(this.page, null, "  ")
    )


    // username: "deleteTempUser_8fbkqvueP"
    // user_id: "qbK7SjzunhotN6nK3"
    // d_code: "fenalUI"
    // group_id: "8B8B6eLFoPEF2vT8q"
    //
    // q_code: "5278"
    // q_color: "#33b2cc"
    // teacher: "none"
    //   page: {view: "Activity"}
    // restore_all: true ||| false?
    //
    //   accountCreated: true
    //   groupCreated: true
    //   loggedIn: true
    //   status: "JoinGroup_success"

    if (this.page) {
      result.page = this.page
    }

    this.setSessionDataFrom(result)

    this.go = result.page || { view: "Activity" }
    this.hideSplash()
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

      const without = [ "join" ]
      const data = this.getParamsFromURL({ without })
      // console.log("treatUserInvitation data:", data)
      // { join
      //
      // , user
      // , own
      // , pin
      // , vo
      // , lang
      //
      // , view
      // , path
      // , index
      // , [data]
      // }

      const result = {
        username: data.user
      , teacher:  data.own
      , q_code:   data.pin
      , join:     true
      }
      delete data.user
      delete data.own
      delete data.pin

      const page = { view: "Profile" }
      const ignorePath = true

      this.mergeParamsAndAccountData(result, data, page, ignorePath)
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


  /**
   * result = account data
   * data   = url params
   * page   = default { view: "Activity" }
   */
  mergeParamsAndAccountData(result, data, defaultPage, ignorePath) {
    result.native     = data.vo
    result.language   = data.lang
    result.auto_login = true // <<< HARD-CODED
    result.role       = "user"

    delete data.vo
    delete data.own
    delete data.lang

    // Convert numerical params from strings to numbers
    for (const key in data) {
      let value = data[key]
      if (!isNaN(value)) {
        data[key] = parseInt(value, 10)
      }
    }

    // Extract expected keys; the rest will be treated as 'data'
    let page
    let { view, path, index, tag } = data
    delete data.view
    delete data.path
    delete data.index
    delete data.tag

    if(!path) {
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

    result.page = page
    this.setSessionDataFrom(result) // unnecessary keys ignored

    if (ignorePath || !page) {
      page = defaultPage
    }

    this.go = page
    this.hideSplash()
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
    , "role"
    ]

    keys.forEach( key => {
      const value = data[key]
      if (value) {
        Session.set(key, value)
      } else {
        Session.set(key, undefined)
        delete Session.keys[key]
      }
    })

    console.log(
      "Session.keys"
    , Session.keys
    )

    // /// <<< TEMPORARY HACK UNTIL MENU IS WORKING
    // const auto_login  = data.auto_login || this.hack
    // const restore_all = data.restore_all || this.hack
    // Session.set("auto_login", auto_login)
    // Session.set("restore_all", restore_all)
    // /// TEMPORARY HACK >>>

    // if (!auto_login) {
    //   Session.set("group_id", undefined)
    //   delete Session.keys.group_id
    // }
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
    const remaining = this.showSplash - new Date()
    if (remaining > 0) {
      // console.log("Polling for", this.showSplash, "in", this.showSplash - + new Date())
      return setTimeout(this.hideSplash, remaining)
    }

    this.showSplash = 0

    // Tell Share to replace the Splash screen will with an
    // interactive view (Profile, Activity or an activity-in-progress)

    // console.log("StartUp preloadComplete(\"" + this.go + "\")")

    //////////////////// ADD group_id???///////////////////////
    this.preloadComplete(this.go, Session.get("group_id"))
  }
}
