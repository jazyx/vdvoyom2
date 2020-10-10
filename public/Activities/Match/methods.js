/**
 * /public/activities/Match/methods.js
 */

import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import collections from '/imports/api/collections/publisher'
const { Group } = collections



export const forceSelect = {
  name: "match.forceSelect"

, call(forceSelectData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [forceSelectData], options, callback)
  }

, validate(forceSelectData) {
    new SimpleSchema({
      group_id: { type: String }
    , type:     { type: String }
    , matches:  { type: String, optional: true }
    }).validate(forceSelectData)
  }

, run(forceSelectData) {
    const { group_id: _id, type, matches } = forceSelectData
    const select = { _id }
    const path = "page.data." + type
    const update = matches
                 ? { $set: { [path]: matches }}
                 : { $unset: { [path]: 0 }}
    Group.update(select, update)
  }
}



export const userMatch = {
  name: "match.userMatch"

, call(userMatchData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [userMatchData], options, callback)
  }

, validate(userMatchData) {
    new SimpleSchema({
      group_id:   { type: String }
    , user_id:    { type: String }
    , matches:    { type: String }
    , pairedWith: { type: String, optional: true }
    }).validate(userMatchData)
  }

, run(matchData) {
    const { group_id: _id, user_id, matches, pairedWith } = matchData
    const select = { _id }
    const path = "page.data.matches." + user_id + "." + matches
    const update = pairedWith
                 ? { $set: { [path]: pairedWith }}
                 : { $unset: { [path]: 0 }}
    Group.update(select, update)
  }
}


const methods = [
  forceSelect
, userMatch
]


methods.forEach(method => {
  Meteor.methods({
    [method.name]: function (args) {
      method.validate.call(this, args)
      return method.run.call(this, args)
    }
  })
})