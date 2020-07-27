/**
 * /public/activities/Drag/deck/tracker.js
 *
 */



import Tracker from '../../shared/tracker'

import collections from '/imports/api/collections/publisher'
const { Drag  } = collections



export class DragTracker extends Tracker {
  constructor() {
    const uiTextSelector = {
      $or: [
        { cue: "congratulations" }
      , { cue: "play_again" }
      ]
    }

    super(uiTextSelector)
  }


  getProps() {
    const props     = super.getProps(Drag)
    props.completed = this.turnCompleted(props.data)

    return this.props
    // { code      // unused
    //   group_id
    // , d_code
    // , uiText
    // , path      // unused
    // , data      // includes subset of items in current task
    // , items     // all possible items
    // , isMaster
    //
    // , completed // custom
    // }
  }


  turnCompleted(data) {
    let completed = 0

    if (typeof data === "object") {
      const show = data.show

      if (typeof show === "object") {
        const keys = Object.keys(show)
        completed = keys.reduce(
          (counter, key) => counter + show[key]
        , completed)
      }
    }

    return completed === 6
  }
}
