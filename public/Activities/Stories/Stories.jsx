/**
 * /public/activities/Stories/Stories.jsx
 *
 * This script imports the Core and Tracker classes from Spiral's
 * deck/ folder, and extends them so that:
 *
 * - The first image is shown alone at maximum size, on a black
 *   background
 * - Clicking on the biggest image shifts all images down one level
 * - Clicking on an earlier image returns to that image
 * - Clicking on a black area has no effect
 * - Frames for areas without images are not shown
 *
 * This allows you to tell a story with images, and to go back to
 * earlier images to comment on them further, without revealing where
 * the story is going.
 */



import { withTracker } from 'meteor/react-meteor-data'

import Core from '../Spiral/deck/SpiralCore'
import Tracker from '../Spiral/deck/SpiralTracker'



// Transparent 1 x 1 pixel placeholder GIF
const blank = "data:image/gif;base64,R0lGODlhAQABAAA"
            + "AACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="



class CustomCore extends Core {
  setStart(event) {
    super.setStart(event, -1)
  }


  getImages() {
    const images = Array(14).fill(blank)

    const source = this.props.items
    const total  = this.props.total
    const start  = ( this.props.start || 0 )
                 + ( this.recycle
                   ? total
                   : 0
                   )

    const first  = Math.max(0, start - this.levels)
    const last   = Math.max(1, start + 1)

    if (last === total) {
      this.recycle = true
    }

    for ( let ii = first ; ii < last ; ii++ ) {
      const index = ii % total
      images.shift()
      images.push(source[index])
    }

    return images
  }
}



class CustomTracker extends Tracker {
  getProps() {
    const props = super.getProps("Stories")
    return props
  }
}



const tracker = new CustomTracker()



export default withTracker(() => {
  return tracker.getProps()
})(CustomCore)
