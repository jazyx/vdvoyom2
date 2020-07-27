/**
 * /public/activities/Flash/deck/tracker.jsx
 */




import Tracker from '../../shared/tracker'

import collections from '/imports/api/collections/publisher'
const { Flash  } = collections




export default class NimTracker extends Tracker{
  getProps() {
    const props = super.getProps(Flash)

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
