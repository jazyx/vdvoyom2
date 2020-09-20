/**
 * /imports/ui/login/launch/StartUp.js
 */


import { Session } from 'meteor/session'

// Helpers
import { removeFrom
       , deleteFrom
       , getRandom
       , getRandomFromArray
       } from '/imports/tools/generic/utilities'
import Storage from '/imports/tools/generic/storage'

// Subscriptions
import collections from '/imports/api/collections/publisher'
const { Shortcut } = collections

// Connection
import { preloadCollections } from './PreloadCollections'

// Methods
import { methods } from '/imports/api/methods/mint'
const { logIn } = methods

// Constant
import { SPLASH_DELAY
       , STARTUP_TIMEOUT
       } from '/imports/tools/custom/constants'



export default class StartUp {
  constructor( setPage ) {
    /// <<< HARD-CODED
    this.hack = window.location.pathname.startsWith("/*")
    /// HARD-CODED >>>

    this.setPage = setPage
    this.showSplash  = + new Date() + SPLASH_DELAY

    this.oneOff = this.oneOff.bind(this)
    this.prepareLaunch = this.prepareLaunch.bind(this)
    this.welcomeGuestUser = this.welcomeGuestUser.bind(this)

    preloadCollections.then(this.prepareLaunch.bind(this))
                      .catch(setPage) // shows "TimeOut"
    // preloadCollections is a promise, so it is guaranteed to be
    // asynchronous. The next command _will_ be executed before
    // prepareLaunch or setPage is called.

    this.readInPresets()
  }


  ///// DETERMINE this.context, this.accountData AND this.page //////

  readInPresets() {
    this.readDataFromStorage() // sets this.storedAccount
                               //      this.storedPage
    this.readDataFromQuery(window.location.search)
                               // sets this.accountData
                               //      this.page
                               //      this.context
  }


  readDataFromStorage() {
    let storedData = Storage.get()
    if (this.context !== "once") {
      storedData = {}
    }

    // Any or all of the following values may be undefined
    const {
      auto_login
    , restore_all
    , username
    // , user_id
    , native
    , teacher
    // , group_id
    , q_code
    , page
    } = storedData

    this.storedAccount = {
        auto_login
      , restore_all
      , username
      // , user_id
      , native
      , teacher
      // , group_id
      , q_code
    }
    deleteFrom(this.storedAccount) // remove all undefined keys

    if (restore_all) {
      this.storedPage = page || {}
      deleteFrom(this.storedPage) // remove all undefined keys

    } else {
      this.storedPage = {}
    }
  }


  readDataFromQuery(search) {
    const data = {}

    if (search) {
      const query   = new URLSearchParams(search)
      this.setContext(query)
                   // once | join | admin | teacher | bare

      query.forEach(function(value, key) {
        data[key] = value
      })
    }

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
      user:    username
    , vo:      native
    , own:     teacher
    , teacher: teacher_id
    , lang:    language
    , pin:     q_code
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
    , "teacher"
    , "language"

    , "pin"
    , "view"
    , "path"
    , "tag"
    , "index"

    , "join"
    , "once"
    ]
    deleteFrom(data, notPageDataKeys)

    // Ignore data if it contains no data
    if (!Object.keys(data).length) {
      data = undefined
    }

    // this.accountData will be an object, but it may be empty
    const accountData = {
      username
    , native
    , teacher    // id for teacher for username
    , teacher_id // id for teacher who is logging in
    , q_code
    , language
    }
    deleteFrom(accountData)
    this.accountData = this.normalizeAccountData(accountData)

    // If neither view or path is given, this.page will be undefined
    const page ={ view, path, tag, index, data }
    deleteFrom(page)
    this.page = this.definePage(page) // may be undefined

    console.log("this.page:", this.page, "this.accountData:", this.accountData)
  }


  definePage(page) {
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
        } else {
          page.index = parseInt(index, 10)
        }
      }

      page.path = path
    }

    return page
  }


  /** Sent by setAccountDataAndPage() from readDataFromQuery()
   *
   * @param      {<type>}  accountData  The account data
   * @return     {<type>}  { description_of_the_return_value }
   */
  normalizeAccountData(accountData) {
    // console.log(
    //   "accountData"
    // , JSON.stringify(accountData, null, "  ")
    // )

    if (this.context === "once") {
      const nonce = accountData.username || this.getRandomString(9)
      accountData.username = "deleteTempUser_" + nonce
      // accountData.restore_all = true

      const defaultValues = Object.assign(
        { language:    "en-GB"
        , native:      navigator.language || navigator.userLanguage
        , teacher:     ""
        // , teacher:     "none"
        // , restore_all: true
        // , auto_login:  true
        }
      , this.storedData // empty if "once" is used
      )

      accountData = Object.assign(defaultValues, accountData)
    }

    // console.log("accountData from URL:", accountData)
    deleteFrom(accountData)

    // if (!Object.keys(accountData).length) {
    //   accountData = undefined
    // }

    return accountData
  }


  ///// MongoDB COLLECTIONS ARE NOW AVAILABLE. LOGIN CAN HAPPEN /////

  prepareLaunch() {
    switch (this.context) {
      case "once":
        return this.autoLogIn("once", this.oneOff)
      case "join":
        return this.treatUserInvitation()
      case "admin":
        return this.treatAdmin()
      case "teacher":
        return this.treatTeacher()

      default:
        // this.context will be "check". The URL may be just a
        // shortcut teach id, but we couldn't check that until the
        // Teacher collection (and the other MongoDB collections)
        // became available.
        this.checkForShortcut()
    }
  }


  /**  Checks if the URL has the form "httpx://example.com/xx" where
   *   <xx> is the `id` of a Teacher document. If so, pro-actively
   *   reads this.teacherData from the Teacher collection.
   *
   * @return  {string}  "teacher" if <xx> is indeed a teacher id
   *                    "user" if no id is present (nor once nor join)
   */
  checkForShortcut() {
    let _id = window.location.pathname.substring(1)

    /// <<< HACK
    _id = decodeURI(_id)
          .replace(/^аа$/i, "aa") // Russian а to Latin a for Настя
    /// HACK >>>

    const select = { _id }
    const project = { fields: {
        query: 1
      }
    }
    const { query } = Shortcut.findOne(select, project) || {}
    console.log(
      "query", query
    , `db.shortcut.find(${JSON.stringify(select)}, ${JSON.stringify(project.fields)})`
    )

    if (query) {
      this.readDataFromQuery(query)
      this.prepareLaunch()
    } else {
      this.context = "user"
      this.treatUser()
    }
  }


  getTeacherData(id) {
    return collections.Teacher.findOne({ id }) // may be undefined
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
  autoLogIn(singleUse, callback) {
    if (typeof singleUse === "function") {
      // Allow singleUse to be omitted
      callback = singleUse
      singleUse = false

    } else if (singleUse) {
      const nonce = this.accountData.username||this.getRandomString(9)
      this.accountData.username = "deleteTempUser_" + nonce
    }

    const defaultValues = {
      d_code:      this.getD_Code()
    , teacher:     ""
    , language:    "en-GB"
    , native:      navigator.language || navigator.userLanguage
    , restore_all: true
    }

    this.accountData = Object.assign(defaultValues, this.accountData)

    logIn.call(this.accountData, callback)
  }


  getD_Code() {
    return this.getRandomString(7)
  }


  oneOff(error, result) {
    // console.log(
    //   "oneOff (error:", error
    // , ") result:", JSON.stringify(result, null, "  ")
    // )
    // console.log(
    //   "this.page"
    // , JSON.stringify(this.page, null, "  ")
    // )

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


  /**
   */
  treatUserInvitation() {
    const callback = this.welcomeGuestUser
    const isSingleUse = false
    const { username, native, teacher, q_code } = this.accountData

    if ( username && native && teacher && q_code ) {
      // All login data is given in the URL. Log in automatically.
      this.autoLogIn( isSingleUse, callback )

    } else {
      // At least one property is missing for autoLogIn. Use data
      // from local storage to fill in the gaps in the data read in
      // from the URL...
      this.accountData = Object.assign(
        this.storedAccount
      , this.accountData
      )

      if (this.storedAccount.auto_login) {
        // ...but only log in automatically if this was requested
        this.autoLogIn( isSingleUse, callback )

      } else {
        // Step through Profile screens with given presets
        this.setSessionDataFrom(this.accountData)
        this.go = { view: "Profile" }
        this.hideSplash()
      }
    }
  }


  welcomeGuestUser(error, result) {
    if (error) {
      return console.log("welcomeGuestUser error:", error)
    }

    // console.log(
    //   "welcomeGuestUser error:", error,
    //   "result:", JSON.stringify(result, null, "  ")
    //  )

      /*
        "teacher":    "jn",
        "language":   "en-GB",
        "native":     "en"
        "username":   "ele",
        "q_code":     "4377",
        "user_id":     "nyGGa7aCYJPtzfGbZ",
        "group_id":    "haqWCZeyKa4nCNiaQ",
        "q_color":     "#33cc93",,
        "restore_all":  true,

        "d_code":  "Pd720t1",
        "status":  "JoinGroup_success",
        "loggedIn": true

        ?? auto_login ??
      */


    if (!result.loggedIn) {
      // `pin` was defined and used for d_code, but it was wrong.
      page = this.manualLoginAfterAutoLoginFailed(result)
      ignorePath = true
      if (!page) {
        return console.log("NO PAGE FOUND IN STARTUP")
      }
    }

    result.role = "user"
    result.page = this.page
    this.setSessionDataFrom(result)

    this.go = this.page || result.page
    this.hideSplash()
  }


  treatUser() {
    console.log("TODO: treatUser")
  }


  treatTeacher(teacherData) {
    if (!teacherData) {
      teacherData = this.getTeacherData(this.accountData.teacher_id)
    }

    if (!teacherData) {
      console.log("Unknown teacher:", this.accountData)
      return
    }

    console.log("teacherData:", teacherData)

    const d_code  = this.getD_Code()

    /// <<< HARD-CODED
    const q_color = "#f00"
    const role    = "teacher"
    /// HARD-CODED >>>

    const {
      id: teacher_id
    , language: native
    } = teacherData

    const accountData = {
      d_code
    , teacher_id
    , native
    , q_color
    , role
    }

    this.setSessionDataFrom(accountData)
    this.go = { view: "Teach" }
    this.hideSplash()
  }


  treatAdmin() {
    console.log("TODO: treatAdmin")
  }

  /// UTILITY METHODS /// UTILITY METHODS /// UTILITY METHODS ///


  /**
   * Called by setSessionDataFromStorage(), oneOff()
   *
   * @param      {<type>}  error   The error
   */
  setSessionDataFrom(data) {
    const keys = [
      "username"
    , "user_id"
    , "native"
    , "teacher"
    , "teacher_id"
    , "language"
    , "d_code"
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

    // console.log(
    //   "Session.keys"
    // , Session.keys
    // )

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


  // /** Called by prepareApp()
  //  *
  //  * @param  {object}  teacher  undefined OR
  //  *                            {"_id" :       <string>,
  //  *                              "file" :     <image filename>,
  //  *                              "id" :       <string>,
  //  *                              "name" : {
  //  *                                "cyrl" :   <string>,
  //  *                                "latn" :   <string>
  //  *                              },
  //  *                              "with" :     <"learn x with Y">,
  //  *                              "language" : <ISO code string,
  //  *                              "script" :   <one of name keys>,
  //  *                              "type" :     "profile",
  //  *                              "version" :  <integer (irrelevant)>,
  //  *                              "logged_in" : [ ... ]
  //  *                            }
  //  */
  // setSessionDataFromStorage(teacher) {
  //   const storedData = Storage.get()

  //   // console.log(
  //   //   "storedData"
  //   // , JSON.stringify(storedData, null, "  ")
  //   // )
  //   /* { username:    "James"
  //    * , user_id:     "H9uMqxwvkySYt7QtP"
  //    * , native:      "en-GB"
  //    * , teacher:     "aa"
  //    * , language:    "ru"
  //    * , group_id:    "naRRNbnrr2syzEhPz"
  //    * , q_code:      "3819"
  //    * , q_color:     "#33cc60"
  //    * , restore_all: false
  //    * , "auto_login":false
  //    *
  //    * [, view:       "Activity"]
  //    * }
  //    */

  //   const keys = Object.keys(storedData)

  //   if (teacher) {
  //     Session.set("teacher_id", teacher.id)
  //     Session.set("native",     teacher.language)
  //     Session.set("language",   teacher.language)
  //     Session.set("role",       "teacher")
  //     Session.set("q_color",    "#f00") // red by default for Teachers
  //     // d_code, q_code, q_color

  //   } else if (keys.length) {
  //     Session.set("role", "user")
  //     this.setSessionDataFrom(storedData)

  //   } else {
  //     // First time user on this device. No storedData to treat
  //   }
  // }


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


  // reJoinGroups() {
  //   // TODO: Integrate menu then remove the following 4 lines
  //   if (!Session.get("auto_login")) {
  //     // console.log("reJoinGroups Returning user:", Session.get("username"))
  //     this.go = { view: "Profile" }
  //     return this.hideSplash()
  //   }

  //   // Log in automatically
  //   const accountData = {
  //     d_code:      Session.get("d_code")
  //   , username:    Session.get("username")
  //   , q_code:      Session.get("q_code")
  //   , group_id:    Session.get("group_id")
  //   , restore_all: Session.get("restore_all")
  //   }

  //   logIn.call(accountData, this.loggedInToGroups)
  // }


  // loggedInToGroups(error, data) {
  //   Session.set("isMaster", data.isMaster || false)
  //   const page = data.page || {}
  //   this.go = page
  //   this.hideSplash()
  // }


  hideSplash() {
    const remaining = this.showSplash - new Date()
    if (remaining > 0) {
      // console.log("Polling for", this.showSplash, "in", this.showSplash - + new Date())
      return setTimeout(this.hideSplash, remaining)
    }

    this.showSplash = 0

    // Tell Share to replace the Splash screen will with an
    // interactive view (Profile, Activity or an activity-in-progress)

    // console.log("StartUp setPage(\"" + this.go + "\")")

    // Add group_id, because this will be undefined during a
    // hot reload, and we can use this fact to prevent a freeze
    // during development.
    this.setPage(this.go, Session.get("group_id"))
  }
}
