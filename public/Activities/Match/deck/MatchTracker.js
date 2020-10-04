/**
 * /public/activities/Match/deck/MatchTracker.js
 *
 */



import Tracker from '../../shared/tracker'

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