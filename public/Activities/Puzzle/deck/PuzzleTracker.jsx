/**
 * /public/activities/Puzzle/deck/PuzzleTracker.jsx
 */



import Tracker from '../../shared/tracker'

import collections from '/imports/api/collections/publisher'
const { Puzzle  } = collections



export default class PuzzleTracker extends Tracker{
  getProps(collectionName = "Puzzle") {
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