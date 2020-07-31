/**
 * /imports/api/methods/fluency/scheduler.js
 */



import { getRandom } from '/imports/tools/generic/utilities'

import collections from '/imports/api/collections/publisher'
const { Fluency } = collections


/// <<< HARD-CODED
const MIN_SPACING    = 5 // minimum of 5 items between repetitions
const FOUR_DAYS      = 5760 // 4 days in minutes
const  MINUTES_TO_MS = 60 * 1000
/// HARD-CODED >>>


export default class Scheduler {
  constructor({ user_id, group_id, correct, timeStamp }) {
    this.user_id   = user_id
    this.group_id  = group_id
    this.correct   = correct
    this.timeStamp = timeStamp

    this.setNextSeen = this.setNextSeen.bind(this)
    const ids = Object.keys(correct)
    this.count = ids.length

    ids.forEach(this.setNextSeen)
  }


  getTime(stamp) {
    if (!stamp) {
      stamp = + new Date()
    }
    return new Date(stamp).toTimeString().substring(0,8)
  }


  setNextSeen(phrase_id) {

    const select = {
      user_id: this.user_id
    , group_id: this.group_id
    , phrase_id
    }

    const fluencyDoc = Fluency.findOne(select)
    /* {
     *   "_id"        : "7nToxTv7iNQ3ge3zj",
     *   "phrase_id"  : "TYhvrctxvi9bHDuvk",
     *   "next_seen"  : 1595577614381,
     *
     *   "user_id"    : "SWvYPe3Xht8AuBgKi",
     *   "group_id"   : "MthDQhr6w4K5yJXrS",
     *
     *   "times_seen" : 0,
     *   "first_seen" : 0,
     *   "last_seen"  : 0,
     *   "flops"      : 4,
     *   "score"      : 0,
     *   "spacing"    : 5,
     *   "collection" : "Vocabulary",
     *   "level"      : "TODO"
     * }
     */

    // Standard housekeeping
    const correct = this.correct[phrase_id]
    const last_seen = + new Date()
    let next_seen

    let { flops, times_seen, first_seen, spacing } = fluencyDoc

    flops = (16 * !correct) + (flops >> 1)

    if (!times_seen) {
      first_seen = last_seen

      if (correct) {
        spacing = FOUR_DAYS * MIN_SPACING
        next_seen = first_seen + (FOUR_DAYS * MINUTES_TO_MS)
        // 4 days => 20 days => 100 days = 3 months +
      }
    }

    const ratio = correct
                ? fluencyDoc.right || 5
                : fluencyDoc.wrong || 1/2
    spacing = Math.max( MIN_SPACING, ratio * spacing )

    if (!next_seen) {
      next_seen = this.reschedule(last_seen, spacing)
    }
    times_seen += 1

    const set = {
      $set: {
        flops
      , times_seen
      , first_seen // may be reset to its current value
      , last_seen  // real time
      , next_seen
      , spacing
      }
    }
    Fluency.update(select, set)
  }


  /**
   * { function_description }
   *
   * @param  {timeStamp} now      milliseconds since the epoch
   * @param  {number}    spacing  minimum number of intervening items
   * @param  {number}    ratio    how spacing should change
   *
   * @return {number}    next_seen timestamp
   */
  reschedule(now, spacing, ratio) {
    let next_seen
    let startTime = this.timeStamp

    const select = {}
    const options = {
      sort: { next_seen: 1 }
    , limit: 1
    , skip: this.count + spacing
    , fields: { next_seen: 1, phrase: 1 }
    }

    // Assume that MIN_SPACING items take about 1 minute, and
    // calculate the time in minutes before the item should be
    // repeated.
    const spaceTime = (spacing / MIN_SPACING) * MINUTES_TO_MS

    // Determine when the item currently that many places further
    // down the queue is scheduled to repeat, and when we expect
    // that should happen.
    const first     = Fluency.find(select, options).fetch()[0]
    let firstTime = this.timeStamp + spaceTime

    // console.log( "first:", first
    //            , "   <<<   db.fluency.find({},"
    //            + JSON.stringify(options.fields)
    //            + ").sort("
    //            + JSON.stringify(options.sort)
    //            + ").skip("
    //            + options.skip
    //            + ").limit("
    //            + options.limit
    //            + ")"
    //            )

    // We want to randomize the spacing a bit, so now we calculate
    // the timing expected for the item twice as far away
    options.skip = this.count + 1 + spacing * 2
    const last = Fluency.find(select, options).fetch()[0]
    let lastTime = this.timeStamp + spaceTime * 2

    // console.log("now:", this.getTime(now))
    // console.log("current:", this.getTime(this.timeStamp))
    // if (first) {
    //   console.log("first:", this.getTime(first.next_seen))
    // } else {
    //   console.log("first", undefined)
    // }
    // console.log("firstTime:", this.getTime(firstTime))
    // if (last) {
    //   console.log("last:", this.getTime(last.next_seen))
    // } else {
    //   console.log("last", undefined)
    // }
    // console.log("lastTime:", this.getTime(lastTime))

    if (first) {
      if (last) {
        if (lastTime > last.next_seen) {
          // Items are scheduled closer together than they can be
          // reviewed. Use the number of intervening items as a
          // guide to when to reschedule. Make the end time earlier.
          lastTime = last.next_seen
        }
      }

      if (firstTime > first.next_seen) {
        // Items are scheduled closer together than they can be
        // reviewed. Use the number of intervening items as a
        // guide to when to reschedule. Make the start time
        // earlier.
        firstTime = first.next_seen

      } else if (firstTime < now) {
        // All items before now will be served with no gaps. But
        // there is a gap, and we don't want this item to be
        // reserved too soon. Delay it until enough items have
        // been served.
        firstTime = first.next_seen

        // Now it's _just_ possible that lastTime is before
        // firstTime, because of the gap.
        if (lastTime < firstTime) {
          lastTime = firstTime + spaceTime
        }

      } else {
        // There may not be enough intervening items before we can
        // show this item again. Using the calculated time, starting
        // from now, will create a gap for new items to be served,
        // if that is necessary.
        firstTime = Math.min(now + spaceTime, first.next_seen)

        lastTime = now + spaceTime * 2
        if (last) {
          lastTime = Math.min(lastTime, last.next_seen)
        }
      }

    } else {
      // There aren't enough items scheduled to use placing.
      // Reschedule from now.
      firstTime = now + spaceTime
      lastTime  = now + spaceTime * 2
    }

    // next_seen = firstTime // (lastTime + firstTime) / 2
    next_seen = getRandom(lastTime, firstTime)

    return next_seen
  }
}