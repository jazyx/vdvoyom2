/**
 * /imports/ui/startup/PreloadCollections.js
 */



// Helpers
import { removeFrom } from '/imports/tools/generic/utilities'

// Subscriptions
import collections from '/imports/api/collections/publisher'

// Constant
import { STARTUP_TIMEOUT } from '/imports/tools/custom/constants'



export const preloadCollections = new Promise((resolve, reject) => {
  // console.log("importing")
  const unReady = []
  let timeOut = -1 // set to positive integer at end of function


  const ready = (collectionName) => {
    removeFrom(unReady, collectionName)

    // console.log("Collection is ready:", collectionName)

    if (!unReady.length) {
      if (timeOut) {
        // Leave this.timeOut as a non-zero value
        clearTimeout(timeOut)
        resolve()
      }
    }
  }


  const connectionTimedOut = () => {
    // console.log("connectionTimedOut")
    timeOut = 0 // this.prepareConnection will not run now
    reject("TimeOut") // reason is not used
  }


  const connectToMongoDB = () => {
    for (let collectionName in collections) {
      unReady.push(collectionName)

      const collection = collections[collectionName]
      // We can send (multiple) argument(s) to the server publisher
      // for debugging purposes
      // console.log("Subscribing to", collection._name)

      const callback = () => ready(collectionName)
      const handle   = Meteor.subscribe(collection._name, callback)
    }
  }


  timeOut = setTimeout(connectionTimedOut, STARTUP_TIMEOUT)
  // console.log("PreloadCollections timeout", timeOut)
  connectToMongoDB()
})
