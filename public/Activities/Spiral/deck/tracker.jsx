/**
 * /public/activities/Spiral/deck/tracker.jsx
 */



import Tracker from '../../shared/tracker'

import collections from '/imports/api/collections/publisher'
const { Spiral  } = collections



export default class SpiralTracker extends Tracker{
  getProps() {
    const props = super.getProps(Spiral)

    return props

    // { code      // unused
    // , group_id
    // , d_code    // unused
    // , uiText    // empty
    // , path      // unused
    // , data      // includes start and total
    // , items     // CURRENTLY KNOWN AS images
    // , isMaster
    //
    // , start
    // , total
    // }
  }


  addCustomProps(props) {
    if (!props.isMaster) {
      // Both master and slaves need the items. For the master, they
      // have already been added to props.

      props.items = this.getItems(Spiral, props.tag)
    }

    props.items = props.items.map( item => item.image)
    props.start = this.getStart(props.data)
    props.total = props.items.length
  }


  getStart(data) {
    if (data) {
      return data.start || 0
    }

    return 0
  }
}