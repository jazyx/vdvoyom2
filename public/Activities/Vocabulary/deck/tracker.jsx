/**
 * /public/activities/Vocabulary/deck/tracker.jsx
 */



import Tracker from '../../shared/tracker'

import { getLocalized } from '/imports/tools/generic/utilities'

import collections from '/imports/api/collections/publisher'
const { Vocabulary, Fluency } = collections



export default class VocabularyTracker extends Tracker{
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
    const props = super.getProps(Vocabulary)
    // Calls addCustomProps() below

    return props

    // { code      // unused
    // , group_id
    // , d_code    // unused
    // , uiText    // empty
    // , path      // unused
    // , data      // includes start and total
    // , isMaster
    // , items     // will be undefined if isMaster is false
    //
    // // master only // //
    // , user_id
    // , queue
    // , unseen
    // }
  }


  addCustomProps(props) {
    if (props.isMaster) {
      const queueData = this.getQueue(props) // cued, queue, unseen
      Object.assign(props, queueData)
    }
  }


  /** Reads all Fluency items for this user and language, by next_seen
   *  time.
   *
   * @param      {object}  props     { user_id:  <>
   *                                 , group_id: <>
   *                                 }
   *
   * @return     {object}  { queue:  [ all items that user has chosen
   *                                   including those fully learned
   *                                   and those not yet seen
   *                                 ]
   *                       , unseen: [ items chosen by topic, but not
   *                                   yet seen (first_seen: 0)
   *                                 ]}
   */
  getQueue({ user_id, group_id }) {
    const select = { user_id, group_id }
    let options = {
      fields: {
        phrase_id: 1
      , next_seen: 1
      , times_seen: 1
      , collection: 1
      }
    , sort: {
        next_seen: 1
      }
    , limit: 120
    }

    let queue = Fluency.find(select, options)
                       .fetch()

    // console.log( "queue:", queue
    //            , "   <<<   db.fluency.find("
    //            + JSON.stringify(select)
    //            + ","
    //            + JSON.stringify(options.fields)
    //            + ").sort("
    //            + JSON.stringify(options.sort)
    //            + ").limit("
    //            + JSON.stringify(options.limit)
    //            + ").pretty()"
    //            )

    /* {
     *   "_id" : "7nToxTv7iNQ3ge3zj",
     *   "phrase_id"  : "TYhvrctxvi9bHDuvk",
     *   "collection" : "Vocabulary",
     *   "next_seen"  : 1595577614381,
     *   "times_seen" : 0,
     *
     *       "user_id" : "SWvYPe3Xht8AuBgKi",
     *       "group_id" : "MthDQhr6w4K5yJXrS",
     *
     *       "first_seen" : 0,
     *       "last_seen"  : 0,
     *       "flops"      : 4,
     *       "score"      : 0,
     *       "level"      : "TODO"
     *
     *   , phrase: <string>
     *   , image: <url>
     *   , audio: <url>
     *   }
     * }
     */


    // Append localized phrase data to queued items
    queue.forEach( item => {
      const _id = item.phrase_id
      const collection = collections[item.collection]
      const select = { _id }
      let phraseData = collection.findOne(select)
      phraseData = this.getLocalizedItem(phraseData, "ignoreId")

      Object.assign(item, phraseData)
    })

    const unseen = queue.filter( doc => !doc.times_seen )
    // console.log("unseen:", unseen)

    // Get an array of all the phrase_ids that this user has been or
    // will be exposed to.
    options = { fields: { phrase_id: 1 } }
    const cued = Fluency.find(select, options)
                        .fetch()
                        .map( item => item.phrase_id )

    return {
      queue
    , unseen
    , cued
    }
  }
}
