/**
 * /imports/api/collections/publisher.js
 */

import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';

import { collections
       , publishQueries
       } from './mint'

// console.log("collections", Object.keys(collections))

if (Meteor.isServer) {
  for (name in collections) {
    const select = publishQueries[name]
    const collection = collections[name]

    // console.log(name, select)

    name = collection._name // name.toLowerCase()

    // The publication method is run each time a client subscribes to
    // the named collection. The subscription may be made directly or
    // through the /imports/api/methods/mint.js script

    Meteor.publish(name, function public(caller, ...more) {
      // We need to use the classic function () syntax so that we can
      // use this to access the Meteor connection and use this.user_id

      let items = collection.find(select) // (customSelect || select)

      if (typeof caller === "string") {
        console.log(
          "Publishing", collection._name, "for", caller, ...more
        )
        // console.log(
        //   "Items 1 - 4 /"
        // , collection.find(select).count()
        // , collection.find(select, { limit: 4 }).fetch()
        // )
      }

      return items
    })
  }
}


// Called by addUserHistoryItem() in join.js
export const getNextIndex = (_id) => {
  const Counters = collections.Counters
  let inc = 1

  if (Meteor.isMeteor) {
    Counters.upsert(
      { _id }
    , { $inc: { index: inc }}
    )

    inc = 0
  }

  const index = (Counters.findOne({ _id })) || { index:0 }.index + inc

  return index
}


export default collections
