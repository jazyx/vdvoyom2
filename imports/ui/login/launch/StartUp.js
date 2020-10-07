/**
 * /imports/ui/login/launch/StartUp.js
 *
 * Reads data from the URL query string and from Local Storage (query
 * string data has priority).
 *
 * Mode
 * ====
 * • once: creates temporary User and Group documents which are
 *         destroyed when the session ends. Visitor has no access to
 *         a teacher or other users.
 * • join: provides page data (and optionally user data). Can be used
 *         to create a new user account and link it to a teacher
 *         Group or a named Group. If no user[name] and pin (q_code)
 *         is given, then data from Local Storage will be used (if
 *         present), or the user will be given the opportunity to
 *         create a new User account (if not)
 * • ace:  May be used in conjunction with `join` to indicate that no
 *         user will be considered Master, so the display will be
 *         optimized for each user's device.
 *         Even if only one user logs in to a group with the `ace`
 *         flag, the entire Group will become ace.
 *
 * Account
 * =======
 *
 * Page data
 * =========
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
const { Shortcut, Group } = collections

// Connection
import { preloadCollections } from './PreloadCollections'

// Methods
import { methods } from '/imports/api/methods/mint'
const { logIn
      , setAce
      } = methods

// Constant
import { SPLASH_DELAY
       , STARTUP_TIMEOUT
       } from '/imports/tools/custom/constants'



let singleton =  0



class StartUpSingleton {
  constructor( setPage ) {
    /// <<< HARD-CODED
    this.hack = window.location.pathname.startsWith("/*")
    /// HARD-CODED >>>

    this.setPage = setPage
    this.showSplash  = + new Date() + SPLASH_DELAY

    this.oneOff = this.oneOff.bind(this)
    this.prepareLaunch = this.prepareLaunch.bind(this)
    this.welcomeGuestUser = this.welcomeGuestUser.bind(this)
    this.updateProfile = this.updateProfile.bind(this)

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

      if (query.has("ace")) {
        data.ace = data.ace !== "false"
      }
    }

    // console.log(
    //   "data"
    // , JSON.stringify(data, null, "  ")
    // )

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
    , group:   group_name
    // mode
    , ace
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
    , "lang"
    , "group"

    , "ace"

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
    , group_name
    , ace
    }
    deleteFrom(accountData)

    if (this.context === "once") {
      this.accountData = this.addNonceDefaults(accountData)
    } else {
      this.accountData = accountData
    }

    // If neither view or path is given, this.page will be undefined
    const page ={ view, path, tag, index, data }
    deleteFrom(page)
    this.page = this.definePage(page) // may be undefined

    // console.log("this.page:", this.page, "this.accountData:", this.accountData)
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


  addNonceDefaults(accountData) {
    // console.log(
    //   "addNonceDefaults accountData:"
    // , JSON.stringify(accountData, null, "  ")
    // )

    const nonce = accountData.username || this.getRandomString(9)
    accountData.username = "deleteTempUser_" + nonce

    const defaultValues = Object.assign(
      { language: "en-GB"
      , native:   navigator.language || navigator.userLanguage
      , teacher:  "none"
      }
    )

    accountData = Object.assign(defaultValues, accountData)

    return accountData
  }


  ///// MongoDB COLLECTIONS ARE NOW AVAILABLE. LOGIN CAN HAPPEN /////

  prepareLaunch() {
    switch (this.context) {
      case "once":
        return this.autoLogIn(this.oneOff)
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
    const options = { fields: {
        query: 1
      }
    }
    const { query } = Shortcut.findOne(select, options) || {}
    // console.log(
    //   "query", query, `\ndb.shortcut.find(
    //     ${JSON.stringify(select)} ${options && options.fields ? `
    //   , ${JSON.stringify(options.fields)}` : ""}
    //   )`
    // )

    if (query) {
      this.readDataFromQuery(query)
      this.prepareLaunch()

    } else {
      // leave this.context as "check"
      this.setProfilePages(this.accountData)
      this.treatUser()
    }
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

    this.group_id = result.group_id

    result.native = this.accountData.native
    result.language = this.accountData.language
    if (this.page) {
      result.page = this.page
    }

    this.setSessionDataFrom(result)

    this.go = result.page || { view: "Activity" }
    this.hideSplash()
  }


  autoLogIn(callback) {
    this.accountData.d_code = this.getD_Code()

    // console.log(
    //   "autoLogIn this.accountData"
    // , JSON.stringify(this.accountData, null, "  ")
    // )

    logIn.call(this.accountData, callback)
  }


  /**
   */
  treatUserInvitation(recursive) {
    const callback     = this.welcomeGuestUser

    const isSingleUse  = false
    const {
      username
    , native
    , teacher
    , q_code
    , group_name
    } = this.accountData
    const canRegister  = !!(username && native && teacher)
    const canAutoLogIn = !!(q_code && canRegister)
    this.accountData.pin_absent = canRegister && !canAutoLogIn

    if ( canRegister ) {
      // All login data is given in the URL — although perhaps the
      // q_code is missing. Log in automatically. If the name is
      // unique then a q_code is not needed, but the NewPIN screen
      // must be shown.
      return this.autoLogIn(callback )

    } else if (!recursive) {
      // At least one property is missing for autoLogIn. Use data
      // from local storage to fill in the gaps in the data read in
      // from the URL...
      this.accountData = Object.assign(
        this.storedAccount
      , this.accountData
      )

      if (this.storedAccount.auto_login) {
        return this.treatUserInvitation("recursive")
      }
    }

    // Step through Profile screens with given presets
    this.setProfilePages(this.accountData)
    this.treatUser()
  }


  /** Callback from treatUserInvitation()
   *
   * @param      {<type>}  error   The error
   * @param      {<type>}  result  The result
   * @return     {<type>}  { description_of_the_return_value }
   */
  welcomeGuestUser(error, result) {
    if (error) {
      return console.log("welcomeGuestUser error:", error)
    }

    // console.log(
    //   "welcomeGuestUser error:", error,
    //   "result:", JSON.stringify(result, null, "  ")
    // )
    // console.log(
    //   "this.accountData"
    // , JSON.stringify(this.accountData, null, "  ")
    // )

    /*
      "teacher":    "jn",
      "language":   "en-GB",
      "native":     "en"
      "username":   "ele",
      "q_code":     "4377",
      "user_id":     "nyGGa7aCYJPtzfGbZ",
      "group_id":    "haqWCZeyKa4nCNiaQ",
      "q_color":     "#33cc93",,
      "restore_all": true,

      "d_code":  "Pd720t1",
      "status":  "JoinGroup_success",
      "loggedIn": true

      ?? auto_login ??
    */

    /* this.accountData
      teacher: "jn"
      language: "en"
      native: "en"
      username: "ELE"

      d_code: "zDgdeMF"
      pin_absent: true
    */

    Object.assign(this.accountData, result) // orginal augmented with new properties

    // console.log(
    //   "this.accountData updated"
    // , JSON.stringify(this.accountData, null, "  ")
    // )

    if (!result.loggedIn || result.pin_absent) {
      // EITHER `pin` was defined and used for q_code, but it was
      //         wrong
      // OR      A new account was created for a user with a unique
      //         name, so we must show the NewPIN screen

      this.setProfilePages(result)
      return this.treatUser()
    }

    const group_id = this.group_id = result.group_id
    result.role = "user"

    this.setAce(group_id, this.accountData.ace)

    const groupPage = this.getGroupPage(group_id)

    // ALERT: URL search may indicate a specific page, but if the
    // group is already active, groupPage will overwrite this.

    result.page = groupPage || this.page
    this.setSessionDataFrom(result)

    this.go = result.page
    this.hideSplash()
  }


  setAce(_id, ace) {
    if (typeof ace === "boolean") {
      const options = {
        _id
      , ace
      }

      setAce.call(options)
    }
  }


  getGroupPage(_id) {
    const select = { _id }
    const options = {
      fields: {
        page: 1
      }
    }

    const { page } = Group.findOne(select, options) || {}

    return page
  }


  setProfilePages(accountData) {
    this.profilePages = []

    let pageData

    if (accountData.status === "RequestPIN" || !accountData.q_code) {
      pageData = { view: "EnterPIN" }
      return this.profilePages.push(pageData)

    } else if (accountData.pin_absent && accountData.q_code) {
      pageData = { view: "NewPIN" }
      return this.profilePages.push(pageData)
    }

    if (!accountData.native) {
      pageData = {
        view: "Native"
      }
      this.profilePages.push(pageData)
    }

    if (!accountData.username) {
      pageData = {
        view: "Name"
      }
      this.profilePages.push(pageData)
    }

    if (!accountData.teacher) {
      pageData = {
        view: "Teacher"
      }
      this.profilePages.push(pageData)
    }
   }


   treatUser() {
    this.go = this.profilePages.shift()
    console.log("treatUser called. this.profilePages", this.profilePages)
    this.hideSplash()
  }


  updateProfile(profileData) {
    console.log(
      "updateProfile profileData"
    , JSON.stringify(profileData, null, "  ")
    , "\nthis.profilePages"
    , JSON.stringify(this.profilePages, null, "  ")
    )

    const actions = [ "back", "view", "next" ]
    const { back, view, next } = deleteFrom(profileData, actions)

    if (back) {
      return console.log("Back button at", view, "=", back)
    } else if (next) {
      return console.log("Next button at", view, "=", next)
    }

    switch (view) {
      case "Native":
        this.setNative(profileData)
      break
      case "Name":
        this.setName(profileData)
      break
      case "Teacher":
        this.setTeacher(profileData)
      break
      case "EnterPIN":
        this.submitPIN(profileData)
      break

      case "NewPIN":
        return this.start()
    }

    const nextPage = this.profilePages.shift()
    if (nextPage) {
      this.setPage(nextPage, this.group_id)
    } else if (!this.accountData.logged_in) {
      this.autoLogIn(this.welcomeGuestUser)
    } else {
      this.setPage(this.page, this.group_id)
    }
  }


  setNative(profileData) {
    console.log("setNative called", profileData)
    this.accountData.native = profileData.native
  }


  setName(profileData) {
    console.log("setName called")
    this.accountData.name = profileData.name
  }


  setTeacher(profileData) {
    console.log("setTeacher called")
    this.accountData.teacher = profileData.teacher
  }


  submitPIN(profileData) {
    if (profileData.q_code) {
      this.accountData.q_code = profileData.q_code
      this.accountData.pin_given = true
      this.autoLogIn(this.welcomeGuestUser)

    } else if (profileData.create_account) {
      this.accountData.status = "CreateAccount"
      this.autoLogIn(this.welcomeGuestUser)
    }
   }


  treatTeacher() {
    const select = { id: this.accountData.teacher_id }
    const teacherData = collections.Teacher.findOne(select)

    // console.log(
    //   "teacherData", teacherData, "\n"
    // , `db.teacher.findOne(
    //     ${JSON.stringify(select)}
    //   )`
    // )

    if (!teacherData) {
      console.log("Unknown teacher:", this.accountData)
      return this.treatUser()
    }

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
    , "ace"
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


  getAccountDetail(key) {
    return this.accountData[key]
  }


  hideSplash() {
    const remaining = this.showSplash - new Date()
    if (remaining > 0) {
      // console.log("Polling for", this.showSplash, "in", this.showSplash - + new Date())
      return setTimeout(this.hideSplash, remaining)
    }

    this.showSplash = 0

    // Add group_id, because this will be undefined during a
    // hot reload, and we can use this fact to prevent a freeze
    // during development.
    this.setPage(this.go, this.group_id)
  }


  start(page) {
    this.setSessionDataFrom(this.accountData)
    const { group_id } = this.accountData
    const go = page || this.page || { view: "Activity" }
    this.setPage(go, group_id)
  }
}



export default function StartUp(setPage) {
  if (!singleton) {
    singleton = new StartUpSingleton(setPage)
  }

  return singleton
}