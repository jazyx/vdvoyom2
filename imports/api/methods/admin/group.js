/**
 * /imports/api/methods/admin/group.js
 */


import collections from '../../collections/publisher'
const { Group, Teacher } = collections



export default class CreateGroup {
  constructor(accountData) {
    // Minimum:
    // { user_id: <>
    // , teacher: <>
    // }

    // console.log("accountData before CreateGroup:", accountData)

    // Read language from Teacher document (unless teacher === "none"
    // in which case, it will have been provided by the URL, or will
    // have defaulted to "en").
    const select = {id: accountData.teacher}
    const options = {
      fields: {
        language: 1
      }
    }
    const { language } = Teacher.findOne(select, options) || {}

    if (language) {
      // A teacher doc was found, so we can overwrite accountData
      accountData.language = language
    }

    const group = {
      owner:      accountData.teacher
    , language:   accountData.language
    , name:       accountData.name || ""
    , active:     false // becomes true if Teacher logs in personally
    , lobby:      ""
    , chat_room:  ""
    , members: [
        accountData.user_id
      , accountData.teacher
      ]
    , logged_in: []
    , page: accountData.page
    // // Will be added by the Client
    // , view_data: {}
    // , view_size: { width, height }
    }
    accountData.group_id = Group.insert(group)
    accountData.groupCreated = true

    if (language) {
      accountData.language = language
    }

    // console.log("accountData after CreateGroup:", accountData)
  }
}