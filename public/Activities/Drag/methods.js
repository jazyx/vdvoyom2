/**
 * /public/activities/Drag/methods.js
 */

import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import collections from '/imports/api/collections/publisher'
const { Group } = collections



export const setViewData = {
  name: "drag.setViewData"

, call(setViewData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [setViewData], options, callback)
  }

, validate(setViewData) {
    new SimpleSchema({
      group_id: { type: String }
    , data: { type: Object, blackbox: true }
    }).validate(setViewData)
  }

, run(setViewData) {
    const { group_id: _id, data } = setViewData
    const select = { _id }
    const set = { $set: { "page.data": data } }
    Group.update(select, set)
  }
}


export const toggleComplete = {
  name: "drag.toggleComplete"

, call(toggleCompleteData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [toggleCompleteData], options, callback)
  }

, validate(toggleCompleteData) {
    new SimpleSchema({
      complete: { type: Boolean }
    , group_id: { type: String }
    }).validate(toggleCompleteData)
  }

, run(toggleCompleteData) {
    const { group_id: _id, complete } = toggleCompleteData
    const select = { _id }
    const set = { $set: { "page.data.complete": complete } }
    const result = Group.update(select, set)

    // console.log( "db.group.update("
    //            + JSON.stringify(select)
    //            + ","
    //            + JSON.stringify(set)
    //            + ") >>> result:", result
    //            )
  }
}



export const toggleShow = {
  name: "drag.toggleShow"

, call(toggleShowData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [toggleShowData], options, callback)
  }

, validate(toggleShowData) {
    new SimpleSchema({
      index:    { type: Number }
    , group_id: { type: String }
    }).validate(toggleShowData)
  }

, run(toggleShowData) {
    const { group_id: _id, index } = toggleShowData
    const select = { _id }
    const set = { $set: { ["page.data.show." + index]: true } }
    const result = Group.update(select, set)

    // console.log( "db.group.update("
    //            + JSON.stringify(select)
    //            + ","
    //            + JSON.stringify(set)
    //            + ") >>> result:", result
    //            )
  }
}


export const setDragTarget = {
  name: "drag.setDragTarget"

, call(dragTargetData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [dragTargetData], options, callback)
  }

, validate(dragTargetData) {
    new SimpleSchema({
      drag_id:  { type: String } // id of HTML element
    , pilot:    { type: String } // d_code for user|teacher's device
    , group_id: { type: String }
    , x:        { type: Number }
    , y:        { type: Number }
    }).validate(dragTargetData)
  }

  /* Call will throw an error if any user (including pilot) started an
   * action but did not complete it.
   * TODO: Ensure that all pilot actions are removed when the pilot
   * logs out.
   */

, run(dragTargetData) {
    const { group_id: _id, pilot, drag_id, x, y } = dragTargetData
    const select = { _id }

    // const options = { fields: { "page.data": 1 } }
    // const { page } = Group.findOne(select, options)
    //               || { page: {} } // if group has no page.data yet
    // const data = page.data || {}
    // if (data.pilot) {
    //   // There is already an operation in progress
    //   throw ("Group " + _id + " locked by a process from " + data.pilot)
    // }

    const set = {
      $set: {
        "page.data.pilot":   pilot
      , "page.data.drag_id": drag_id
      , "page.data.x":       x
      , "page.data.y":       y
      }
    , $unset: {
        "page.data.drop": 0
      }
    }
    return Group.update(select, set)
  }
}


export const updateDragTarget = {
  name: "drag.updateDragTarget"

, call(dragTargetData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [dragTargetData], options, callback)
  }

, validate(dragTargetData) {
    new SimpleSchema({
      group_id: { type: String }
    , pilot:    { type: String }
    , x:        { type: Number }
    , y:        { type: Number }
    }).validate(dragTargetData)
  }

, run(dragTargetData) {
    const { group_id: _id, pilot, x, y } = dragTargetData
    const select = { _id, "page.data.pilot": pilot }
    const set = {
      $set: {
        "page.data.x": x
      , "page.data.y": y
      }
    }
    return Group.update(select, set)
  }
}


export const dropDragTarget = {
  name: "drag.dropDragTarget"

, call(dropTargetData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [dropTargetData], options, callback)
  }

, validate(dropTargetData) {
    new SimpleSchema({
      group_id: { type: String }
    }).validate(dropTargetData)
  }

, run(dropTargetData) {
    const { group_id: _id } = dropTargetData
    const select = { _id }
    const unset = {
      $unset: {
        "page.data.pilot":   0
      , "page.data.drag_id": 0
      , "page.data.x":       0
      , "page.data.y":       0
      }
    }
    return Group.update(select, unset)
  }
}


const methods = [
  setViewData
, toggleShow
, toggleComplete
, setDragTarget
, updateDragTarget
, dropDragTarget
]


methods.forEach(method => {
  Meteor.methods({
    [method.name]: function (args) {
      method.validate.call(this, args)
      return method.run.call(this, args)
    }
  })
})