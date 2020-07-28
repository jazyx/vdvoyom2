/**
 * /public/activities/Cloze/js/methods.js
 */

import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import collections from '/imports/api/collections/publisher'
const { Group } = collections



export const setPageData = {
  name: "cloze.setPageData"

, call(pageData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [pageData], options, callback)
  }

, validate(pageData) {
    new SimpleSchema({
      group_id:  { type: String }
    , data: { type: Object, blackbox: true }
    }).validate(pageData)

    new SimpleSchema({
      "phrase":        { type: String }
    , "image":         { type: String }
    , "input":         { type: String }
    , "requireSubmit": { type: Boolean }
    , "_id":           { type: String }
    }).validate(pageData.data)
  }

, run(pageData) {
    const { group_id: _id, data } = pageData
    const select = { _id }
    const set = { $set: { "page.data": data } }
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
      group_id: { type: String }
    , input:    { type: String }
    }).validate(inputData)
  }

, run(inputData) {
    const { group_id: _id, input } = inputData
    const select = { _id }
    const set = { $set: { "page.data.input": input } }
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
  setPageData
, updateInput
]


methods.forEach(method => {
  Meteor.methods({
    [method.name]: function (args) {
      method.validate.call(this, args)
      return method.run.call(this, args)
    }
  })
})