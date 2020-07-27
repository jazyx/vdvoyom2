/**
 * /imports/api/methods/admin/join.js
 */

import { removeFrom } from '../../../tools/generic/utilities'
import collections
     , { getNextIndex }
       from '../../collections/publisher'
const { User, Group } = collections



export default class JoinGroup {
  constructor(accountData) {
    /* console.log("JoinGroup", accountData)
     *
     * { user_id: "YZ2xJoHf5SDzZPQED"
     * , d_code: "dm4eN"
     *
     * // Manual log in will use teacher to find group_id, or will
     * // create a new group using user_id, teacher and language
     * // (group_id will be overridden, because it might refer to
     * //  the last group the user joined, rather than the group with
     * //  this teacher)
     * , teacher:  "aa"
     * , language: "ru"
     *
     * // auto_login will not have teacher or language, so requires
     * // group_id
     * , group_id: "97NS2hDEYntEhXXbr"
     * }
     */

    let {user_id, d_code, teacher, language, group_id } = accountData
    if (teacher && language) {
      group_id = this.groupWithThisTeacher(user_id, teacher)
    }

    if (group_id) {
      // The user might have chosen a different group from last time
      accountData.group_id = group_id
    } else {
      return accountData.status = "CreateGroup"
      // We'll be back
    }

    let success = this.joinGroup(group_id, d_code)

    if (success) {
      const d_codes = this.getLoggedInCodes(group_id)
      accountData.page = this.getPage(accountData, d_codes)
      success = this.addUserHistoryItem(group_id, d_code, user_id)

      if (success) {
        accountData.status = "JoinGroup_success"
      } else {
        accountData.status = "JoinGroup_noHistoryItem"
      }

      this.moveTeacherDCodeToEnd(group_id, d_codes)

    } else {
      accountData.status = "JoinGroup_fail"
    }
  }


  groupWithThisTeacher(user_id, teacher) {
    const select = {
      members: {
        $all: [
          user_id
        , teacher
        ]
      , $size: 2
      }
    }

    const { _id } = (Group.findOne(select) || {})

    return _id
  }


  joinGroup( group_id, d_code) {
    const select = { _id: group_id }
    const push = { $push: { logged_in: d_code }}
    const success = Group.update(select, push)

    return success
  }


  getPage(accountData, d_codes) {
    let page = { view: "Activity" }

    let readFromGroup = d_codes.length > 1
    if (!readFromGroup) {
      readFromGroup = accountData.restore_all
    }

    if (readFromGroup) {
      const select = { _id: accountData.group_id }
      const options = { fields: { page: 1 }}
      const groupData = Group.findOne(select, options)
      if (groupData && groupData.page) {
        page = groupData.page
      }
    }

    // console.log("join.js getPage page:", page)

    return page
  }

  // TODO is the genNextIndex thing needed? Is it even working?

  addUserHistoryItem(group_id, d_code, user_id) {
    const index = getNextIndex("history") // could use a random value
    const select = { _id: user_id }
    const item  = { in: index }
    const path  = "history." + group_id
    // { ...
    // , history: {
    //     <group_id>: [ ...
    //     , { d_code: "xxxxx"
    //       , in:  ISO_loggedInTime
    //       , out: ISO_loggedOutTime
    //       , status: { TBD }
    //       }
    //     ]
    //   }
    // , ...
    // }

    // Insert the { in: <...> } history item at index position 0, so
    // that a subsequent operation to add an out: <...> field to this
    // item will find it.

    const push = {
      $push: {
        [path]: {
          $each: [item]
        , $position: 0
        }
      }
    }

    let success = User.update(select, push)

    if (success) {
      select[path + ".in"] = index
      const created = {
        $currentDate: { [path + ".$.in"]: true }
      }

      // console.log( "db.user.update("
      //            + JSON.stringify(select)
      //            + ", "
      //            + JSON.stringify(created)
      //            + ")"
      //            )

      success = User.update(
        select
      , created
      )
    }

    return success
  }


  getLoggedInCodes(_id) {
    // Get a list of all the logged_in d_codes
    const select = { _id }
    const options = { fields: { logged_in: 1 } }
    const { logged_in } = Group.findOne(select, options)

    // console.log( "logged_in:", logged_in
    //            , "   <<<   db.group.findOne("
    //            + JSON.stringify(select)
    //            + ","
    //            + JSON.stringify(options.fields)
    //            + ").pretty()"
    //            )

    return logged_in
  }


  moveTeacherDCodeToEnd(_id, d_codes) {
    // Get the _ids of the Users with the given d_codes
    const logged_in = d_codes.map( d_code => ({ logged_in: d_code }) )
    const userSelect = {
      $or: logged_in
    }
    const options = { fields: { logged_in: 1 } }
    const users = User.find(userSelect, options).fetch()

    // console.log( "user:", user
    //            , "   <<<   db.user.find("
    //            + JSON.stringify(userSelect)
    //            + ","
    //            + JSON.stringify(options.fields)
    //            + ").pretty()"
    //            )

    // Remove the d_codes of known users from logged_in
    users.forEach( userData => {
      const user_codes = userData.logged_in
      const removeFunction = ( item => user_codes.includes(item) )
      removeFrom(d_codes, removeFunction, true)
    })

    // If there are any d_codes left, they must be the teacher's
    // console.log("logged_in:", logged_in)

    const groupSelect = { _id }
    d_codes.forEach( teacher_code => {
      // Remove it from the logged_in array...
      const pull = { $pull: { logged_in: teacher_code } }
      const push = { $push: { logged_in: teacher_code } }
      Group.update(groupSelect, pull)

      // ... and then add it back at the end
      Group.update(groupSelect, push)
    })

    // Alternative solution:
    // * Add a logged_in field to the Teacher records
    // * Get the _id of the owner of this Group
    // * Retrieve the d_codes of that teacher
    // * Find which of those d_codes are present in the logged_in list
    // * Remove all those d_codes from the list
    // * Add them back at the end
  }
}