/**
 * /imports/ui/Chat.jsx
 */

import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data'
import { Session } from 'meteor/session'

import collections from '../api/collections/publisher'
const { Chat } = collections


let instance = 0

class ChatClass extends Component {
  constructor(props) {
    super(props)

    // console.log("Chat instance:", instance += 1)
  }


  render() {
    return <div
      id="chat"
    >
    </div>
  }
}



export default withTracker(() => {
  const _id = Session.get("group_id")
  const select = { /* Get message data for this group and admin */ }
  const messages = [] // Chat.find(select).fetch()

  return {
    messages
  }
})(ChatClass)
