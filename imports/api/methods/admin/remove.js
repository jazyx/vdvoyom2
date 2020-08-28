/**
 * /imports/api/methods/admin/remove.js
 */



import collections from '../../collections/publisher'
const { User, Group } = collections


export default class RemoveUserAndGroup {
  constructor(logOutData) {
    let { id, d_code, group_id } = logOutData
    // logOutData.remove will be true

    if (!group_id) {
      group_id = this.getGroup_id(d_code)
    }

    User.remove({ _id: id })
    Group.remove( { _id: group_id } )
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