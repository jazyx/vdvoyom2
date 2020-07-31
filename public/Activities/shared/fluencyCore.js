/**
 * /public/activities/shared/fluencyCore.js
 *
 * Extend this class in order to add a queue of the 12 Fluency items
 * that are most in need of review to this.props.
 *
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import { addToFluency
       , setFluency
       } from '/imports/api/methods/admin'



export default class FluencyCore extends Component {
  constructor(props, options) {
    super(props)

    /// <<< HARD-CODED can be overridden by options
    this.queueJump   = 60 * 1000
    this.itemSpacing = 10 * 1000 // 10 seconds = 6 / minute
    this.collection  = "MUST_BE_SET_THROUGH_OPTIONS"
    /// HARD-CODED >>>

    Object.assign(this, options)

    // console.log(JSON.stringify(props, null, "  "))
    /* { view
     * , aspectRatio
     *
     * , code
     * , d_code
     * , user_id
     * , group_id
     * , uiText
     * , path
     * , tag
     * , data         // depends on exercise
     * , isMaster
     *
     * // master only //
     * , items: [     // from chosen topic
     *     { _id:    <string>
     *     , phrase: <string>
     *     , image:  <url>
     *     , audio:  <url>
     *     }
     *   , ...
     *   ]
     * , queue: [
     *     { _id:        <Fluency id>
     *       collection: "Vocabulary"
     *     , phrase_id:  <collection _id>
     *     , next_seen:  <timestamp
     *     , times_seen: <integer>
     *
     *     , phrase:     <string>
     *     , image:      <url>
     *     , audio:      <url>
     *     }
     *   , ...
     *   ]
     * , unseen    // like queue, where times_seen === 0
     * , cued      // array of phrase_ids of all Fluency docs
     * }
     */

    this.treatResult = this.treatResult.bind(this)
  }


  checkForNewItems() {
    const { items, queue, cued } = this.props
    let newItems = false

    if (items.length) {
      const notInQueue = []
      const inQueue = []

      items.forEach( item => {
        const _id = item._id
        if (cued.indexOf(_id) < 0 ) {
          notInQueue.push(_id)
        } else {
          inQueue.push(_id)
        }
      })

      // TODO: Ask if items already seen should be viewed again. This
      // will require a separate render before creating the new
      // queue.
      newItems = notInQueue.length

      if (newItems) {
        this.synchronizeSet(notInQueue, queue[0], this.collection)
      }
    }

    return newItems
  }


  /**
   * { function_description }
   *
   * @param {array}   newItems  [ { _id:    <phrase_id>
   *                                , name:   <>
   *                                , phrase: { code: <> }
   *                                , image:  [ ... ]
   *                                , audio:  { code: [ ... ] }
   *                                , tags:   [ ... ]
   *                                }
   *                              ]
   * @param {<type>} firstInQueue { _id:        <>
   *                              , user_id:    <>
   *                              , phrase_id:  <>
   *                              , collection: <Collection>
   *                              , activity:   <Activity>
   *                              , score:      <0.0 - 1.0>
   *                              , level:      < >
   *                              , times_seen: <number>
   *                              , last_seen:  <timestamp>
   *                              , first_seen: <timestamp>
   *
   *                              , next_seen:  <timestamp>
   *                              }
   */
  synchronizeSet(newItems, firstInQueue={}, collection) {
    const { user_id, group_id } = this.props
    const { next_seen } = firstInQueue // may be undefined
    const now = + new Date()
    const startTime = next_seen && next_seen < now
                    ? next_seen - this.queueJump
                    : now

    newItems = newItems.map((phrase_id, index) => {
      const next_seen = startTime + (index * this.itemSpacing)

      return {
        phrase_id
      , user_id
      , group_id
      , next_seen
      , collection
      }
    })

    addToFluency.call(newItems)
  }


  treatResult(correct, timeStamp, partial) {
    // console.log("treatResult")

    if (this.props.isMaster) {
      const { user_id, group_id } = this.props
      const result = {
        user_id
      , group_id
      , correct
      , timeStamp
      }

      setFluency.call(result)

      if (!partial) {
        // console.log("treatResult - calling chooseNextActivity")

        this.chooseNextActivity()
      }
    }
  }


  chooseNextActivity() {}
}
