/**
 * /public/activities/Flash/methods.js
 */

import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import collections from '/imports/api/collections/publisher'
const { Groups } = collections



export const placeholder = {
  name: "flash.placeholder"

, call(placeholderData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [placeholderData], options, callback)
  }

, validate(placeholderData) {
    // new SimpleSchema({
    //   group_id: { type: String }
    // , data: { type: Object, blackbox: true }
    // }).validate(placeholderData)
  }

, run(placeholderData) {
    // const { group_id: _id, data } = placeholderData
    // const select = { _id }
    // const set = { $set: { "page.data": data } }
    // Groups.update(select, set)
  }
}


const methods = [
  placeholder
]


methods.forEach(method => {
  Meteor.methods({
    [method.name]: function (args) {
      method.validate.call(this, args)
      return method.run.call(this, args)
    }
  })
})