/**
 * /public/activities/Spiral/deck/SpiralTracker.jsx
 */



import Tracker from '../../shared/tracker'

import collections from '/imports/api/collections/publisher'
const { Spiral  } = collections



export default class SpiralTracker extends Tracker{
  getProps(collectionName = "Spiral") {
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
    if (!props.isMaster) {
      // Both master and slaves need the items. For the master, they
      // have already been added to props.

      props.items = this.getItems(this.collectionName, props.tag)
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