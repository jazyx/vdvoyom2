/**
 * /public/activities/Cloze/methods.js
 */

import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import collections from '/imports/api/collections/publisher'
const { Group } = collections



export const updateInput = {
  name: "cloze.updateInput"

, call(inputData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [inputData], options, callback)
  }

, validate(inputData) {
    new SimpleSchema({
      group_id:  { type: String }
    , input:     { type: String }
    , selection: { type: Number }
    }).validate(inputData)
  }

, run(inputData) {
    const { group_id: _id, input, selection } = inputData
    const select = { _id }
    const set = {
      $set: {
        "page.data.input": input
      , "page.data.selection": selection
      }
    }
    Group.update(select, set)

    // console.log(
    //   "db.group.update("
    // + JSON.stringify(select)
    // + ","
    // + JSON.stringify(set)
    // + ")"
    // )
  }
}



const methods = [
  updateInput
]



methods.forEach(method => {
  Meteor.methods({
    [method.name]: function (args) {
      method.validate.call(this, args)
      return method.run.call(this, args)
    }
  })
})