/**
 * /public/activities/Match/deck/MatchTracker.js
 *
 */



import Tracker from '../../shared/tracker'

import { deleteFrom } from '/imports/tools/generic/utilities.js'

import collections from '/imports/api/collections/publisher'
const { Match } = collections




export default class MatchTracker extends Tracker{
  getProps() {
    const props = super.getProps("Match")

    return props
    // { code      // unused
    //   group_id
    // , d_code    // unused
    // , uiText    // empty
    // , path      // unused
    // , data      // includes subset of items in current task
    // , items     // all possible items
    // , isMaster
    // }
  }


  // Don't localize anything
  getLocalizedItem(document) {return document}


  addCustomProps(props, collectionName) {
    this.addItemsRegardlessOfMasterStatus(props, collectionName)

    if (props.isTeacher) {
      this.addGroupMembersForTeacher(props)
    }
  }


  addItemsRegardlessOfMasterStatus(props, collectionName) {
    // console.log(
    //   "props"
    // , JSON.stringify(props, null, "  ")
    // )

    const items = this.getItems(collectionName, props.tag)

    // console.log(
    //   "items"
    // , JSON.stringify(items, null, "  ")
    // )

    let { named, anon } = items.reduce(( map, itemData ) => {
      // { "matches" : "James",
      //   "text" : "James",
      //   "index" : 0,
      //   "src" : "/Assets/Match/Test/James/cave.jpg",
      //
      //   "_id" : "8RQnpQgCdA63Ate8s",
      //   "tags" : [
      //     "test"
      //   ]
      // }

      deleteFrom(itemData, ["tags", "_id"])

      if (itemData.index) {
        map.named.push(itemData)
      } else {
        map.anon.push(itemData)
      }
      return map
    }, { named: [], anon: [] })

    // console.log(
    //   "anon"
    // , JSON.stringify(anon, null, "  ")
    // )

    // console.log(
    //   "named"
    // , JSON.stringify(named, null, "  ")
    // )

    props.items = { named, anon }
  }


  addGroupMembersForTeacher(props) {
    let select = { _id: props.group_id }
    let options = {
      fields: {
        logged_in: 1
      }
    }

    let { logged_in } = collections.Group.findOne(select, options)

    // console.log(
    //   "logged_in", logged_in, `\ndb.group.findOne(
    //     ${JSON.stringify(select)} ${options && options.fields ? `
    //   , ${JSON.stringify(options.fields)}` : ""}
    //   )`
    // )

    /// <<< CALC on join.js moveTeacherDCodeToEnd()
    logged_in = logged_in.map( d_code => ({ logged_in: d_code }) )
    select = {
      $or: logged_in
    }
    /// CALC >>>
    options = {
      fields: {
        fullname: 1
      }
    }

    const users = collections.User.find(select, options).fetch()

    // console.log(
    //   "users", users, `\ndb.user.find(
    //     ${JSON.stringify(select)} ${options && options.fields ? `
    //   , ${JSON.stringify(options.fields)}` : ""}
    //   ).pretty()`
    // )

    props.users = users
  }
}