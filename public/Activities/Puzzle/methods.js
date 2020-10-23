/**
 * /public/activities/Puzzle/methods.js
 */



import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { collections } from '../../../../imports/api/collections/mint'
const { Group } = collections



export const placeholder = {
  name: 'puzzle.placeholder'

, call(placeholderData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [placeholderData], options, callback)
  }

, validate(placeholderData) {
    new SimpleSchema({
      group_id: { type: String }
    , start:    { type: Number }
    }).validate(placeholderData)
  }

, run(placeholderData) {
    const { group_id: _id, start } = placeholderData
    const select = { _id }
    const set    = { $set: { "page.data.start": start } }
    Group.update(select, set)
  }
}



// To register a new method with Meteor's DDP system, add it here
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