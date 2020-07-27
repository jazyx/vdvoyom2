/**
 * /imports/api/methods/admin/group.js
 */


import collections from '../../collections/publisher'
const { Group } = collections



export default class CreateGroup {
  constructor(accountData) {
    // Minimum:
    // { user_id: <>
    // , teacher: <>
    // , language: <>
    // }

    // console.log("accountData before CreateGroup:", accountData)

    const group = {
      owner:      accountData.teacher
    , language:   accountData.language
    , active:     false // becomes true if Teacher logs in personally
    , lobby:      ""
    , chat_room:  ""
    , members: [
        accountData.user_id
      , accountData.teacher
      ]
    , logged_in: []
    // // Will be added by the Client
    // , view_data: {}
    // , view_size: { width, height }
    }
    accountData.group_id = Group.insert(group)
    accountData.groupCreated = true

    // console.log("accountData after CreateGroup:", accountData)
  }
}