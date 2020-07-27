/**
 * sampler.js
 *
 * Use an instance of this class to retrieve a random set of items
 * from an array, with the items being randomly recycled for reuse.
 */

import { shuffle
       , getRandom
       } from './utilities'

class Sampler {
  constructor({
    array      // must be an array
  , sampleSize = 1
  , skip       = Math.ceil(Math.sqrt(array.length - sampleSize)) || 0
  }) {
    this.array = shuffle(array.slice(0))
    this.sampleSize = sampleSize
    this.skip = skip
    this.sample = []
  }


  getSample(sampleSize = this.sampleSize) {
    this._recycleCurrentSample()

    this.sample = this.array.splice(0, sampleSize)
    const output = this.sample.slice(0)

    return output
  }


  /**
   * Restores the items in `this.sample` to `this.array`, ensuring
   * that the first `this.skip` items are not disturbed.
   */
  _recycleCurrentSample() {
    this.sample.forEach(item => {
      let index = getRandom(this.array.length + 1, this.skip)
      this.array.splice(index, 0, item)
    })
  }
}

export default Sampler