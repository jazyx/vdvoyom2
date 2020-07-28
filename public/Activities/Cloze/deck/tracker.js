/**
 * /public/activities/Cloze/deck/tracker.js
 */



import Tracker from '../../shared/tracker'

import { collections } from '/imports/api/collections/mint'
const { Cloze} = collections



export default class ClozeTracker extends Tracker{
  constructor() {
    const uiTextSelector = undefined // TODO
    super(uiTextSelector)
  }


  getProps() {
    const props = super.getProps(Cloze)

    return props

    // { code      // unused
    // , group_id
    // , d_code    // unused
    // , uiText    // empty?
    // , path      // unused
    // , data
    // , items     // CURRENTLY KNOWN AS tasks
    // , isMaster
    // }
  }
}