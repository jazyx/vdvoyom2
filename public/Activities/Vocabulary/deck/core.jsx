/**
 * /public/activities/Vocabulary/deck/core.jsx
 *
 *
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import views from './mint'

import { addToFluency
       , setFluency
       } from '/imports/api/methods/admin'



let instance = 0



export default class Vocabulary extends Component {
  constructor(props) {
    super(props)

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

    console.log("Vocabulary instance:", ++instance)

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
        this.synchronizeSet(notInQueue, queue[0])
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
  synchronizeSet(newItems, firstInQueue={}) {
    const { user_id, group_id } = this.props
    const { next_seen } = firstInQueue // may be undefined
    const now = + new Date()
    const startTime = next_seen && next_seen < now
                    ? next_seen - 60000
                    : now
    const timing = 10000 // 10 seconds = 6 / minute

    newItems = newItems.map((phrase_id, index) => {
      const next_seen = startTime + index * timing

      return {
        phrase_id
      , user_id
      , group_id
      , next_seen
      }
    })

    addToFluency.call(newItems)
  }


  treatResult(correct, timeStamp) {
    const { user_id, group_id } = this.props
    const result = {
      user_id
    , group_id
    , correct
    , timeStamp
    }

    setFluency.call(result)
  }


  getView(view) {
    const View = views[view]

    return <View
      {...this.props}
      treatResult={this.treatResult}
    />
  }


  render() {
    if (this.props.isMaster) {
      const queue = this.props.queue
      if (!queue) {
        return "Queue not found"
      }

      const newItems = this.checkForNewItems()
      if (newItems) {
        return "Refreshing"
      }

      const length = queue.length

      if (!length) {
        return "Vocabulary subview goes here"
      }

    }

    const view = "Drag" // TODO: Choose view intelligently

    const View = this.getView(view)

    return View
  }
}
