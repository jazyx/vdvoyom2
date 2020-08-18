/**
 * /public/activities/Show/Show.jsx
 *
 * This script imports the Core and Tracker classes from the deck/
 * folder, extends the classes and overwrites any methods as necessary
 * and exports the resulting component.
 */



import { withTracker } from 'meteor/react-meteor-data'

import Core from './deck/ShowCore'
import Tracker from './deck/ShowTracker'

// import collections from '/imports/api/collections/publisher'
// const { Drag } = collections



// class CustomTracker extends Tracker{
//   getImages() {
//     const select = { image: { $exists: 1 }}
//     const images = Drag.find(select)
//                        .fetch()
//                        .map( data => data.image[0].src )
//     return images
//   }
// }



// const tracker = new CustomTracker()

const tracker = new Tracker()



export default withTracker(() => {
  return tracker.getProps()
})(Core)
