/**
 * /public/activities/Nim/deck/tracker.js
 *
 */



import Tracker from '../../shared/tracker'

import collections from '/imports/api/collections/publisher'
const { Nim } = collections




export default class NimTracker extends Tracker{
  getProps() {
    const props = super.getProps(Nim)

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
