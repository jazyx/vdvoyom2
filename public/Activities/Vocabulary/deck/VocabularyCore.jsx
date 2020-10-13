/**
 * /public/activities/Vocabulary/deck/VocabularyCore.jsx
 *
 *
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import views from './mint'

import FluencyCore from '../../shared/fluencyCore'
import { switchActivity } from '/imports/api/methods/admin'
import { NO_AUDIO_DELAY } from '/imports/tools/custom/constants'



let instance = 0



export default class Vocabulary extends FluencyCore {
  constructor(props) {
    const options = {
      collection: "Vocabulary"
    }
    super(props, options)

    this.setNextActivity = this.setNextActivity.bind(this)
    this.viewsToChoose = ["Drag", "Cloze"] // Object.keys(views)

    if (props.isMaster) {
      this.setNextActivity()
    }
  }


  getView() {
    const activity = this.props.activity
    const View = views[activity]

    if (!View) {
      return "Awaiting view"
    }

    // console.log("Vocabulary getView:", this.props.activity)
    // console.log(this.props.data)

    return <View
      {...this.props}
      treatResult={this.treatResult} // in FluencyCore
    />
  }


  chooseNextActivity() {
    // console.log("Vocabulary chooseNextActivity called")

    setTimeout(() => {
      this.setNextActivity()
    }, NO_AUDIO_DELAY)
  }


  setNextActivity() {
    const activity = this.viewsToChoose.shift()
    this.viewsToChoose.push(activity)

    if (this.activity === activity) {
      return
    }

    this.activity = activity

    switchActivity.call({
      _id: this.props.group_id
    , activity
    })

    // console.log("Vocabulary setNextActivity view:", activity)
  }


  render() {
    if (this.props.isMaster) {
      const queue = this.props.queue
      if (!queue) {
        return "Queue not found"
      }

      const newItems = this.checkForNewItems()
      //                    ^ in FluencyCore
      if (newItems) {
        return "Refreshing"
      }

      const length = queue.length

      if (!length) {
        return "Vocabulary subview goes here"
      }
    }

    const View = this.getView()

    return View
  }
}
