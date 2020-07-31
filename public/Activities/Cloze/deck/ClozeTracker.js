/**
 * /public/activities/Cloze/deck/tracker.js
 */



import FluencyTracker from '../../shared/fluencyTracker'

import { collections } from '/imports/api/collections/mint'
const { Cloze} = collections



export default class ClozeTracker extends FluencyTracker{
  constructor() {
    const uiTextSelector = undefined // TODO
    super(uiTextSelector)
  }


  getProps(collectionName = "Cloze") {
    const props = super.getProps(collectionName)

    return props
    /* { code
     * , d_code
     * , user_id
     * , group_id
     * , logged_in // used by Drag to tell if pilot is still online
     * , uiText
     * , path
     * , tag
     * , data
     * , isMaster
     *
     * // master only // //
     * , items // [{ phrase, image, audio, native }]
     * , queue
     * , cued
     * , unseen
     * }
     */
  }
}