/**
 * /imports/api/methods/admin/loginTeacher.js
 *
 * A teacher is connecting at the beginning of a session, or returning
 * to the Teach view
 */


import collections from '../../collections/publisher'
const { Teacher, Group } = collections



export default class LogInTeacher {
  constructor(accountData) {
    // console.log("LogInTeacher accountData:", accountData)

    const { id, d_code } = accountData
    const left = this.leaveAllGroups(id, d_code)
    const loggedIn = this.setLoggedIn(id, d_code)

    accountData.loggedIn = loggedIn
  }


  setLoggedIn(id, d_code) {
    const select = { id }
    const addToSet = {
      $addToSet: {
        logged_in: d_code
      }
    }
    const result = Teacher.update(select, addToSet) // 1 = success; 0 = not

    // console.log( "setLoggedIn:", result
    //            , "db.teacher.update("
    //            + JSON.stringify(select)
    //            + ", "
    //            + JSON.stringify(addToSet)
    //            + ")"
    //            )

    return result
  }


  leaveAllGroups(id, d_code) {
    const select = { members: id, logged_in: d_code }
    const pull = {
      $pull: {
        logged_in: d_code
      }
    }
    const result = Group.update(select, pull) // 1 = success; 0 = not

    // console.log( "leaveAllGroups:", result
    //            , "db.group.update("
    //            + JSON.stringify(select)
    //            + ", "
    //            + JSON.stringify(pull)
    //            + ")"
    //            )

    return result
  }
}