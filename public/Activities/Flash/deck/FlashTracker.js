/**
 * /public/activities/Flash/deck/FlashTracker.jsx
 */




import Tracker from '../../shared/tracker'

import collections from '/imports/api/collections/publisher'
const { Flash  } = collections




export default class FlashTracker extends Tracker{
  getProps(collectionName = "Flash") {
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
     * // master only //
     * , items // [{ phrase, image, audio, native }]
     * }
     */
  }
}
