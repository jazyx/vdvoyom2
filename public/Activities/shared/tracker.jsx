/**
 * /public/activities/shared/tracker.jsx
 */



import { Session } from 'meteor/session'

import { getLocalized } from '/imports/tools/generic/utilities'

import collections from '/imports/api/collections/publisher'
const { Group, UIText } = collections



export default class Tracker{
  constructor(uiTextSelector = { _id: { $exists: false } }) {
    this.uiTextSelector = uiTextSelector
    this.getLocalizedItem = this.getLocalizedItem.bind(this)
  }


  getProps(collectionName) {
    let items

    this.native = Session.get("native")
    const code = this.code = Session.get("language")
    const d_code = Session.get("d_code")
    const user_id = Session.get("user_id")
    const group_id = Session.get("group_id")

    const uiText = this.getUIText()
    const { page, logged_in, activity } = this.getGroupData(group_id)
    const { path, data, tag } = page

    const isMaster = Array.isArray(logged_in) && logged_in.length
                   ? logged_in[0] === d_code
                   : false

    if (isMaster) {
      items = this.getItems(collectionName, tag)
    }

    const props = {
      code
    , d_code
    , user_id
    , group_id
    , logged_in // used by Drag to tell if pilot is still online
    , uiText
    , path
    , tag
    , activity
    , data
    , isMaster
    // items will be undefined if isMaster is false
    , items // [{ phrase, image, audio, native }]
    }

    this.addCustomProps(props, collectionName)
    // may be overwritten in child instance

    return props
  }


  getUIText() {
    const uiText = UIText.find(this.uiTextSelector).fetch()
                         .reduce(( map, data ) => {
                           const cue = data.cue
                           const phrase = getLocalized(data,this.code)
                           map[cue] = phrase

                           return map
                         }, {})
    /* {
     *   "_id" : "j5K9JpMQRwnzfNRCA",
     *   "cue" : "congratulations",
     *   "ru" : "Отлично!",
     *   "en" : "Congratulations!",
     *   "fr" : "Félicitations!",
     *   "type" : "phrase",
     *   "version" : 10
     * }
     * {
     *   "_id" : "hGMwPzYBsTe8mvtiW",
     *   "cue" : "play_again",
     *   "ru" : "Ещё раз играть",
     *   "en" : "Play Again",
     *   "fr" : "Rejouer",
     *   "type" : "phrase",
     *   "version" : 10
     * }
     * =>
     * { "congratulations": "Отлично!"
     * , "play_again":      "Ещё раз играть"
     * }
     */

    return uiText
  }


  getGroupData(_id) {
    const groupSelect = { _id }
    let options = {
      fields: {
        page: 1
      , logged_in: 1
      , activity: 1
      }
    }
    const groupData = Group.findOne(groupSelect, options)
    return groupData
  }


  getItems(collectionName, tags) {
    const collection = collections[collectionName]
    let select
    if (typeof tags === "string") {
      select = { tags }
    } else {
      tags = tags.map( tag => ({ tags: tag } ) )
      // [ "tag", ...] => [ { tags: "tag" }, ...]
      select  = { $or: tags }
    }

    // TODO: Allow tags to be an object selecter

    let items = collection.find(select).fetch()

    // console.log( "items:", items
    //            , "db." + collection._name + ".find("
    //            + JSON.stringify(select)
    //            + ")"
    //            )

    items = items.map(this.getLocalizedItem)

    return items
  }


  getLocalizedItem(document) {
    const item = { _id: document._id }
    const code = this.code
    const generic = code.replace(/-\w+$/, "")

    let image
      , audio
      , native

    let phrase = document.phrase
    if (typeof phrase === "object") {
      native = getLocalized(phrase, this.native)
      phrase = getLocalized(phrase, this.code)
    }
    if (typeof phrase === "string") {
      item.phrase = phrase
      item.native = native
    }

     // TODO: allow various images
    if (Array.isArray(document.image)) {
      image = document.image[0]
      if (typeof image === "object") {
        image = image.src
      }
    } else {
      image = document.image
    }

    if (typeof image === "string") {
      item.image = image
    }

    // TODO: Find localized audio
    if (typeof document.audio === "object") {

      audio = document.audio[code]
      if (!audio) {
        audio = document.audio[generic]
      }

      if (Array.isArray(audio)) {
        audio = audio[0]
        if (typeof audio === "object") {
          audio = audio.src
        }
      }

      if (typeof audio === "string") {
        item.audio = audio
      }
    }


    return item
  }


  addCustomProps(props, collectionName) {
    // Overwrite this method in child instance
  }
}
