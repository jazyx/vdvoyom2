/**
 * /imports/api/methods/assets.js
 *
 */

import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'

import ImportAssets from './assets/importAssets'

import collections from '../collections/publisher'
const { Group } = collections
// used by share, setPage and setIndex


/** Creates or updates a User record after profiling
 *  Calling the method a second time reuses the existing records
 */
export const importFolder = {
  name: 'assets.importFolder'

, call(importData, callback) {
    const options = {
      returnStubValue: true
    , throwStubExceptions: true
    }

    Meteor.apply(this.name, [importData], options, callback)
  }

, validate(importData) {
    // new SimpleSchema({
    //   username: { type: String }
    // , native:   { type: String }
    // , teacher:  { type: String }
    // , language: { type: String }
    // , d_code:   { type: String }

    // // action will have been added if the original call was to logIn
    // , action:   { type: String, optional: true }
    // }).validate(importData)
  }

, run(importData) {
    new ImportAssets(importData)
  }
}


// To register a new method with Meteor's DDP system, add it here
const methods = [
  importFolder
]

methods.forEach(method => {
  Meteor.methods({
    [method.name]: function (args) {
      method.validate.call(this, args)
      return method.run.call(this, args)
    }
  })
})