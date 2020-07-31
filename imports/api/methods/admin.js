/**
 * /imports/api/methods/admin.js
 *
 * Based on...
 *   https://guide.meteor.com/methods.html#advanced-boilerplate
 * ... with the important addition of a `return` statement in each
 * entry for Meteor.methods()
 *
 * createAccount() is called from the Submit view after the user has
 *   selected a native language, a username and a teacher. It creates
 *   a User record and a Group record with the chosen teacher, and
 *   indicates a logged_in status in both.
 *
 *   User:  { $set: { logged_in: true } }
 *   Group: { $push { logged_in: user_id } }
 *
 *   If it is called more than once with the same username and native
 *   language/teacher, the  existing records are used. If the user
 *   changes language or teacher, a new User record or a new Group
 *   record will be created.
 *
 *   NOTE: one teacher who works with two different languages will
 *   have two different teacher ids
 *
 * log() combines login and logout
 *   Called from Teach (constructor => logTeacherIn) and Menu
 *   (beforeunload => logOut)
 *
 *   When anyone logs in, the logged_in status of their profile record
 *   (Teacher or User) is set to true
 *   When anyone logs out, their logged_in status is set to false and
 *   their loggedOut status is set to an ISODate, so that we can
 *   calculated how long ago they were last seen
 *   When users log in or out, their id is push to or pulled from
 *   the logged_in array of all the group they belong to
 *   When teachers log out, the active state of their current group
 *   is set to false.
 *
 * reGroup() combines join group and leave group
 *   Called for users from the Connect view
 *
 * NOTE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Methods specific to the Points collection are defined separately in
 * /imports/api/collections/points.js
 * <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
 *
 */

import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import LogIn from './admin/login'
import LogOut from './admin/logout'
import JoinGroup from './admin/join'
import LeaveGroup from './admin/leave'
import CreateGroup from './admin/group'
import LogInTeacher from './admin/loginTeacher'
import CreateAccount from './admin/account'
import ToggleActivation from './admin/activate'

import Scheduler from './fluency/scheduler'

import collections from '../collections/publisher'
const { Group, Fluency, Vocabulary } = collections
// used by share, setPage and setIndex


/** Creates or updates a User record after profiling
 *  Calling the method a second time reuses the existing records
 */
export const createAccount = {
  name: 'vdvoyom.createAccount'

, call(accountData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [accountData], options, callback)
  }

, validate(accountData) {
    new SimpleSchema({
      username: { type: String }
    , native:   { type: String }
    , teacher:  { type: String }
    , language: { type: String }
    , d_code:   { type: String }

    // action will have been added if the original call was to logIn
    , action:   { type: String, optional: true }
    }).validate(accountData)
  }

, run(accountData) {
    new CreateAccount(accountData) // modifies accountData

    // console.log("After CreateAccount accountData is", accountData)

    new LogIn(accountData)     // , action: "loggedIn"

    // console.log("Data to return from CreateAccount", accountData)

    return accountData
  }
}



/** Creates or updates a Group record with a teacher after profiling
 *  Calling the method a second time reuses the existing group
 */
export const createGroup = {
  name: 'vdvoyom.createGroup'

, call(accountData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [accountData], options, callback)
  }

, validate(accountData) {
    new SimpleSchema({
      user_id: { type: String }
    , teacher:  { type: String }
    , language: { type: String }

    // Other properties may exist but will not be used
    , username: { type: String, optional: true }
    , native:   { type: String, optional: true }
    , d_code:   { type: String, optional: true }
    , action:   { type: String, optional: true }
    }).validate(accountData)
  }

, run(accountData) {
    new CreateGroup(accountData) // modifies accountData
    new JoinGroup(accountData)   // action

    return accountData
  }
}



/** Logs a user's device into its Group and User records
 *
 *  Creates a new account if necessary, or asks for confirmation by
 *  PIN number if ownership of a name is uncertain
 */
export const logIn = {
  name: 'vdvoyom.logIn'

, call(logInData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [logInData], options, callback)
  }

, validate(logInData) {
    // console.log(JSON.stringify(logInData, null, "  "))
    new SimpleSchema({
      username: { type: String }
    , d_code:   { type: String }

    , restore_all: { type: Boolean, optional: true }

    // Sent only if automatic login is NOT used
    , native:   { type: String, optional: true } // for User doc
    , teacher:  { type: String, optional: true } // for Group doc
    , language: { type: String, optional: true } //      —⫵—

    , q_code:   { type: String, optional: true } // created on server
    // if q_code is missing or does not match username, Client may be
    // asked to provide a PIN, and then logIn will be called again.
    // In that case, status will be set to "RequestPIN" which may be
    // altered to "CreateAccount" if user has no PIN, and pin_given
    // will be set to true
    , pin_given:{ type: Boolean, optional: true }
    , status :  { type: String, optional: true }

    // Sent only if localStorage is available on Client
    , user_id:  { type: String, optional: true }
    , group_id: { type: String, optional: true }
    , q_color:  { type: String, optional: true }

    // May not be useful on Client, so not available
    , q_index:  { type: Number, optional: true }
    }).validate(logInData)
  }

, run(logInData) {
    new LogIn(logInData)

    let { status } = logInData

    switch (status) {
      // New user
      case "CreateAccount":
        createAccount.run(logInData) // fall through to createGroup
      case "CreateGroup":
        createGroup.run(logInData)   // logInData modified
        return logInData

      // Existing user, perhaps with a new teacher
      case "loggedIn":
        new JoinGroup(logInData) // fall through; action: loggedIn
        if (logInData.status === "CreateGroup") {
          createGroup.run(logInData)
        }

      // Name that matches an existing user, but invalid q_code
      case "RequestPIN":
        return logInData

      default:
        throw "Unknown action in vdvoyom.logIn: '" + action + "'"
    }
  }
}



/** Logs a teacher's device into its Group and User records
 *
 *  A
 */
export const logInTeacher = {
  name: 'vdvoyom.logInTeacher'

, call(logInData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [logInData], options, callback)
  }

, validate(logInData) {
    new SimpleSchema({
      id:       { type: String }
    , d_code:   { type: String }
    }).validate(logInData)
  }

, run(logInData) {
    new LogInTeacher(logInData)
    return logInData
  }
}



/** Logs a teacher's device into its Group and User records
 *
 *  A
 */
export const toggleActivation = {
  name: 'vdvoyom.toggleActivation'

, call(groupData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [groupData], options, callback)
  }

, validate(groupData) {
    new SimpleSchema({
      _id:    { type: String }
    , d_code: { type: String }
    , active: { type: Boolean }
    }).validate(groupData)
  }

, run(groupData) {
    new ToggleActivation(groupData)
    return groupData
  }
}



/** Logs a user's device out of its Group and User records
 *
 *
 */
export const logOut = {
  name: 'vdvoyom.log'

, call(logOutData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [logOutData], options, callback)
  }

, validate(logOutData) {
    new SimpleSchema({
      id:       { type: String }
      // < 5 chars = teacher; > 5 chars = user
      // 'xxxx' => 456976 combinations
    , d_code:   { type: String }
      // A Teacher might log out without being part of a group
    // , group_id: { type: String, optional: true }
    }).validate(logOutData)
  }

, run(logOutData) {
    new LeaveGroup(logOutData) // adds .leftGroup = [<id>, ...]
    new LogOut(logOutData)

    return logOutData
  }
}



/** Allows the master to share view_size with slaves
 */
export const share = {
  name: 'vdvoyom.share'

, call(shareData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [shareData], options, callback)
  }

, validate(shareData) {
    new SimpleSchema({
      _id:  { type: String }
    , key:  { type: String }
    , data: SimpleSchema.oneOf(
        { type: String }
      , { type: Object, blackbox: true }
      )
    }).validate(shareData)
  }

, run(shareData) {
    const { _id, key, data } = shareData
    const select = { _id }
    const set    = { $set: { [key]: data } }
    Group.update(select, set)

    // console.log( shareData, JSON.stringify(select), JSON.stringify(set))
  }
}


export const setPage = {
  name: 'vdvoyom.setPage'

, call(setPageData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [setPageData], options, callback)
  }

, validate(setPageData) {
    // TODO:
    // Ensure that either view or path (or both) are present
    // Ensure that index (if present) is not greater than
    //   path.length - 1

    const tagSchema = new SimpleSchema.oneOf(
      { type: String }
    , { type: Array }
    )

    new SimpleSchema({
      group_id:     { type: String }
    , page:         { type: Object }
    , "page.view":  { type: String,  optional: true }
    , "page.path":  { type: String,  optional: true }
    , "page.index": { type: Number,  optional: true }
    // , "page.activity": { type: String,  optional: true }
    , "page.tag":   { type: tagSchema, optional: true }
    , "page.tag.$": { type: String }
    , "page.data":  {
        type: Object
      , optional: true
      , blackbox: true
      }
    }).validate(setPageData)
  }

, run(setPageData) {
    const { group_id: _id, page } = setPageData
    const select = { _id }
    const set    = { $set: { page } }
    Group.update(select, set)

    // console.log(
    //   'db.group.update('
    // + JSON.stringify(select)
    // + ", "
    // + JSON.stringify(set)
    // + ")"
    // // , setPageData
    // )
  }
}


export const setIndex = {
  name: "vdvoyom.setIndex"

, call(setIndexData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [setIndexData], options, callback)
  }

, validate(setIndexData) {
    new SimpleSchema({
      group_id: { type: String }
    , index:    { type: Number }
    }).validate(setIndexData)
  }

, run(setIndexData) {
    const { group_id: _id, index } = setIndexData
    const select = { _id }
    const set = { $set: { "page.index": index } }
    Group.update(select, set)
  }
}


export const switchActivity = {
  name: "vdvoyom.switchActivity"

, call(groupData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [groupData], options, callback)
  }

, validate(groupData) {
    new SimpleSchema({
      _id:      { type: String }
    , activity: { type: String }
    }).validate(groupData)
  }

, run(groupData) {
    const { _id, activity } = groupData
    const select = { _id }
    const update = {
      $unset: { "page.data": 0 }
    , $set:   { activity}
    }
    Group.update(select, update)
  }
}


export const addToFluency = {
  name: 'vocabulary.addToFluency'

, call(fluencyItemArray, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [fluencyItemArray], options, callback)
  }

, validate(fluencyItemArray) {
    fluencyItemArray.forEach( item => {
      new SimpleSchema({
          phrase_id:  { type: String }
        , user_id:    { type: String }
        , group_id:   { type: String }
        , next_seen:  { type: Number }
        , collection: { type: String }
      }).validate(item)
    })
  }

, run(fluencyItemArray) {
    const fillers = {
      times_seen: 0
    , first_seen: 0
    , last_seen:  0
    , flops:      4
    , score:      0
    , spacing:    5 // show 5 others before a repeat | ≈ 1 minute
    // , right:      5
    // , wrong:      1/2
    , level:      "TODO"
    }

    fluencyItemArray.forEach( fluencyObject => {
      fluencyObject = {...fluencyObject, ...fillers}
      Fluency.insert(fluencyObject)
    })
  }
}


export const setFluency = {
  name: "vdvoyom.setFluency"

, call(setFluencyData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [setFluencyData], options, callback)
  }

, validate(setFluencyData) {
    new SimpleSchema({
      user_id:   { type: String }
    , group_id:  { type: String }
    , correct:   { type: Object, blackbox: true }
    , timeStamp: { type: Number }
    }).validate(setFluencyData)
  }

, run(setFluencyData) {
    new Scheduler(setFluencyData)
  }
}



// To register a new method with Meteor's DDP system, add it here
const methods = [
  createAccount
  , createGroup
  , logIn
  , logOut
  , logInTeacher
  , toggleActivation
  , share
  , setPage
  , setIndex
  , switchActivity
  , addToFluency
  , setFluency
]



methods.forEach(method => {
  Meteor.methods({
    [method.name]: function (args) {
      method.validate.call(this, args)
      return method.run.call(this, args)
    }
  })
})