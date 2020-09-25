/**
 * /imports/api/methods/admin/remove.js
 */


import { Session } from 'meteor/session'

import collections from '../../collections/publisher'
const { User, Group } = collections


export default class RemoveUserAndGroup {
  constructor(logOutData) {
    let { id, d_code, group_id } = logOutData
    // logOutData.remove will be true

    if (!group_id) {
      group_id = this.getGroup_id(d_code)
    }

    //console.log("Removing user", id, "from group", group_id)

    let result = User.remove({ _id: id })
    // console.log("Remove user:", result)
    result = Group.remove( { _id: group_id } )
    // console.log("Remove group:", result)

    // result = User.find().fetch()
    // console.log(
    //   "Users:"
    // , JSON.stringify(result.length, null, "  ")
    // )

    // result = Group.find().fetch()
    // console.log(
    //   "Group:"
    // , JSON.stringify(result.length, null, "  ")
    // )


    if (Meteor.isClient) {
      Session.set("user_id", undefined)
      Session.set("username", undefined)
      Session.set("group_id", undefined)

      delete Session.keys['user_id']
      delete Session.keys['user_name']
      delete Session.keys['group_id']
    }
  }



  getGroup_id(d_code) {
    const select = { logged_in: d_code }
    const options = {}
    const _ids = Group.find(select, options)
                       .fetch()
                       .map(doc => doc._id)
    if (_ids.length > 1) {
      console.log("Leaving multiple groups?", _ids)
    }

    return _ids[0] // may be undefined
  }
}