/**
 * /public/activities/Spiral/Spiral.jsx
 *
 * This script imports the Core and Tracker classes from the deck/
 * folder, extends the classes and overwrites any methods as necessary
 * and exports the resulting component.
 */



import { withTracker } from 'meteor/react-meteor-data'

import Core from './deck/core'
import Tracker from './deck/tracker'

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
