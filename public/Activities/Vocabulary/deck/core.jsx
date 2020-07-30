/**
 * /public/activities/Vocabulary/deck/core.jsx
 *
 *
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import views from './mint'

import FluencyCore from '../../shared/fluencyCore'


let instance = 0



export default class Vocabulary extends FluencyCore {
  constructor(props) {
    const options = {
      collection: "Vocabulary"
    }
    super(props, options)
  }


  getView(view) {
    const View = views[view]

    return <View
      {...this.props}
      treatResult={this.treatResult} // in FluencyCore
    />
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

    const view = "Drag" // TODO: Choose view intelligently

    const View = this.getView(view)

    return View
  }
}
