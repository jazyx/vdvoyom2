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
}


// items = [ {
//     index:    0 | 1
//     matches: <folder name>
//     src:     "/Assets/Match/Newton/frame.jpg"
//     text:    <folder name or arbitrary text>
//
//     tags:    ["test"]
//     _id:     "ogczq37KWxh8FkBTN"
// }
// , ...
// ]