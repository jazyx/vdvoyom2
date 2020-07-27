/**
 * /imports/api/methods/admin/activate.js
 */


import collections from '../../collections/publisher'
const { Group } = collections



export default class ToggleActivation {
  constructor(groupData) {
    // console.log("ToggleActivation groupData:", groupData)

    const { _id, d_code, active } = groupData
    const action = active
                 ? "$push"
                 : "$pull"

    const select = { _id }
    const update = {
      $set: {
        active
      }
    , [action]: {
        logged_in: d_code
      }
    }
    const result = Group.update(select, update)
    // 1 = success; 0 = not

    // console.log( "ToggleActivation:", result
    //            , "db.group.update("
    //            + JSON.stringify(select)
    //            + ", "
    //            + JSON.stringify(update)
    //            + ")"
    //            )

    if (result) {
      groupData.teacher_logged_in = true
    }
  }
}