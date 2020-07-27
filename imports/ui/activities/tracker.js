/**
 * /imports/ui/activities/tracker.js
 *
 * Generate props which allow us to display either:
 * - The icons for all the available activities
 * - The icons for the current section of the selected activity
 */



import { Session } from 'meteor/session'
import { getLocalized } from '../../tools/generic/utilities'
import { getIconSrc } from '../../tools/custom/project'
import { SET_REGEX } from '../../tools/custom/constants'

import collections from '../../api/collections/publisher'
const { UIText, Activity, Group } = collections



class ActivityTracker{
  constructor() {
    this.localized = this.localized.bind(this)
  }


  getProps() {
    const group_id = Session.get("group_id")
    this.code = Session.get("native")

    const uiText = this.getUIText()
    let { path, index, tag } = this.getPathIndexAndTag(group_id)
    let items

    if (!path || isNaN(index) || !index) {
      items = this.getActivityList()
      index = 0

    } else {
      const activityData = this.getActivityData(path)
      this.useActivityName(activityData.name, uiText)
      items = this.getActivitySelection(activityData, path, index)
    }

    return {
      group_id
    , uiText
    , path
    , index
    , tag
    , items
    }
  }


  getUIText() {
    const select = {
      $or: [
        { cue: "activity" }
      , { cue: "start" }
      ]
    }

    const uiText = UIText.find(select)
                         .fetch()
                         .reduce(( map, data ) => {
                           const cue = data.cue
                           map[cue] = getLocalized(data, this.code)

                           return map
                         }, {})
    return uiText
  }


  getPathIndexAndTag(group_id) {
    const pathSelect = {_id: group_id }
    const options    = { fields: { page: 1 }}
    const { page }   = ( Group.findOne(pathSelect, options) || {} )

    if (page) { // may be undefined
      let { path, index, tag } = page

      // tag may be undefined, but other properties should be typed
      if (!path) {
        path = ""
      }
      if (isNaN(index) || !index) {
        index = 0
      }

      return { path, index, tag }
    }

    // No page is defined
    return {}
  }


  getActivityData(path) {
    const activityName = path.split(SET_REGEX)[0]
    const select  = { path: activityName }
    const options = {
      fields: {
        name: 1
      , collection: 1
      , select: 1
      }
    }

    const data = Activity.findOne(select, options)

    return data
  }


  useActivityName(nameData, uiText) {
    const name = getLocalized(nameData, this.code)

    uiText.activity = name
  }


  getActivitySelection(activityData, path, index) {
    let { collection, select } = activityData
    // select from activityData is only used when index === 0, to
    // choose the initial source of first-level choices. Otherwise,
    // { parent } will be used instead

    const setArray = path.split(SET_REGEX)
    const parent = setArray.slice(0, index).join("")

    if ( !collection ) {
      collection = setArray[0].substring(1)
    }

    collection = collections[collection]
    if ( index > 1 || !select ) {
      select = { parent }
    }

    const options = {
      fields: {
        name: 1
      , description: 1
      , icon: 1
      , path: 1
      , tag: 1
      }
    }

    return collection.find(select, options)
                     .fetch()
                     .map(this.localized)
  }


  getActivityList() {
    const options = {
      fields: {
        "name": 1
      , "description": 1
      , "icon": 1
      , "path": 1
      , "tag":  1 // only present for standalone activities
      }
    }

    let activities =  Activity.find({}, options)
                              .fetch()
                              .map(this.localized)

    return activities
  }


  localized(activityData) {
    if (activityData.name) {
      activityData.name = getLocalized(
        activityData.name
      , this.code
      )
    }
    if ( activityData.description) {
      activityData.description = getLocalized(
        activityData.description
      , this.code
      )
    }
    if (activityData.icon) {
      activityData.icon = getIconSrc(
        activityData.icon
      , this.code
      )
    }

    return activityData
  }
}



export default new ActivityTracker()