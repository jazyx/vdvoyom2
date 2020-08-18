/**
 * /public/activities/Show/deck/ShowTracker.jsx
 */



import Tracker from '../../shared/tracker'

import collections from '/imports/api/collections/publisher'
const { Show  } = collections



export default class ShowTracker extends Tracker{
  getProps(collectionName = "Show") {
    this.collectionName = collectionName
    const props = super.getProps(collectionName)

    return props
    /* { code
     * , d_code
     * , user_id
     * , group_id
     * , logged_in
     * , uiText
     * , path
     * , tag
     * , data
     * , isMaster
     * , items // [{ phrase, image, audio, native }]
     *
     * , start
     * , total
     * }
     */
  }


  addCustomProps(props) {
  }
}