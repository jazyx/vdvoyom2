/**
 * /imports/api/methods/admin/logout.js
 */



import collections from '../../collections/publisher'
const { User, Teacher, Group } = collections


export default class LogOut {
  constructor(logOutData) {
    const { id, d_code } = logOutData

    const update = {
      $pull: {
        logged_in: d_code
      }
    }

    let key
      , collection

    const isTeacher = (id.length < 5)

    if (isTeacher) {// "xxxx" => 456976 teacher id`s
      key = "id"
      collection = Teacher

    } else {
      key = "_id"
      collection = User
    }

    const select = { [key]: id }

    const result = collection.update(select, update)

    // console.log( "result:", result
    //            , "<<< LogOut device db."
    //               + collection._name
    //               + ".update("
    //            + JSON.stringify(select)
    //            + ", "
    //            + JSON.stringify(update)
    //            + ")"
    //            )
  }
}