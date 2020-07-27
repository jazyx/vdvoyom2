/**
 * /imports/ui/debug/deck/tracker.jsx
 */



import { getLocalized } from '/imports/tools/generic/utilities.js'

import collections from '/imports/api/collections/publisher'
const { Vocabulary, Fluency } = collections







export default class DebugTracker{
  constructor() {
    this.getPhrase = this.getPhrase.bind(this)
  }


  getProps() {
    this.start = + new Date()

    const user_id = Session.get("user_id")
    const group_id = Session.get("group_id")

    const select = { user_id, group_id }
    const options = {
      sort: { next_seen: 1 }
    , fields: {
        phrase_id: 1
      , flops: 1
      , next_seen: 1
      , last_seen: 1
      }
    }

    const fluency = Fluency.find(select, options)
                           .map(this.getPhrase)
    return {
      fluency
    }
  }


  getPhrase({
    phrase_id: _id
  , flops
  , next_seen: next
  , last_seen: last
  }) {

    const select = { _id }
    const options = {
      fields: {
        phrase: 1
      }
    }
    const { phrase } = Vocabulary.findOne(select, options)

    flops = (32 + flops).toString(2).substring(1)
    next = this.getWhen(next)
    const text = getLocalized(phrase, "en-GB")

    return {
      flops
    , next
    , text
    , last
    }
  }


  getWhen(timeStamp) {
    const date = new Date(timeStamp)
    // if (!start) {
    //   start = date
    // }

    let delta = date - this.start
    const sign = ["+", "-"][0 + (delta < 0)]
    delta = Math.abs(delta)

    let seconds = Math.round(delta / 1000)
    let minutes = Math.floor(seconds / 60)
    seconds = seconds - minutes * 60
    let hours = Math.floor(minutes / 60)
    minutes = minutes - hours * 60
    let days = Math.floor(hours / 24)
    hours = hours - days * 24

    if ((seconds || minutes || hours || days) && seconds < 10) {
      seconds = "0" + seconds
    }
    if ((minutes || hours || days) && minutes < 10) {
      minutes = "0" + minutes
    }
    if ((hours || days) && hours < 10) {
      hours = "0" + hours
    }

    let when = days
             ? days + "d "
             : ""
    when += hours || days
          ? hours + "h "
          : ""
    when += hours || days || minutes
          ? minutes + "m "
          : ""
    when += seconds + "s"
    when = sign + when

    return when
  }
}
