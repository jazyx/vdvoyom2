/**
 * /server/main.js
 */

import { Meteor } from 'meteor/meteor'

// Activate the MongoDB-free Points collection (for tracking user
// mouse and touch positions) and the methods associated with it
import '../imports/api/collections/points'

import SetUp from './setup'



Meteor.startup(() => {
  if (Meteor.isDevelopment) {
    // Regenerate the various mint.js files that import and then
    // re-export combined collection, method and activity scripts
    // This ensures that access to MongoDB reflects any changes to
    // the activity modules
    new SetUp()
  }

  // Now that the MongoDB cellections and the methods to access them
  // are in sync with the activities, we can:
  // * Update the UIText and Teacher collections
  // * Update the Activity collections if necessary
  require('./launch.js')
});
