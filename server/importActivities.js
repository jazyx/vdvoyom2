/**
 * /server/import.js
 *
 *
 */



import '/imports/api/methods/mint'

import Log from '/imports/api/methods/assets/log.js'
import IOHelper from '/imports/api/methods/assets/ioHelper'

import { ACTIVITY_FOLDER } from '/imports/tools/custom/constants'
import { removeFrom } from '/imports/tools/generic/utilities'


import collections  from '/imports/api/collections/publisher.js'
const { Activity } = collections


const fs = require('fs')
const path = require('path')


/// <<< HARD-CODED
const jsonName = "root.json"
/// HARD-CODED >>>



export default class importActivities extends IOHelper{
  constructor() {
    super()

    this.logger = new Log()
    this.log = this.logger.addEntry

    this.treatActivityFolder = this.treatActivityFolder.bind(this)

    this.importAll()

    this.logger.save()
  }


  importAll() {
    const contents = fs.readdirSync(ACTIVITY_FOLDER)
    // console.log("importAll contents:", contents)
    // [ 'Cloze', 'Drag', 'Flash', 'Spiral', 'Vocabulary', 'icon.jpg' ]

    // Ensure that there is an icon that represents all activities
    // for the top-most Menu item
    const iconMap = this.getIconMap(
      ACTIVITY_FOLDER
    , contents
    )

    // getIconMap() removes icon name from contents.  All the
    // remaining names should be activity folders

    contents.forEach(this.treatActivityFolder)
  }


  /**
   * Called by importAll()
   *
   * @param    {string}   activity  name of activity folder
   */
  treatActivityFolder (activity) {
    const activityPath = path.join(ACTIVITY_FOLDER, activity)

    const stats = fs.statSync(activityPath)
    if (!stats.isDirectory()) {
      return
    }

    var contents = fs.readdirSync(activityPath)
    // console.log("treatActivityFolder", activityPath, contents)
    // [ 'basic', 'home', 'icon', 'root.json' ]

    let cancelled = this.jsonIsMissing(contents, activityPath)
    // if (cancelled) { console.log("jsonIsMissing")}

    if (!cancelled) {
      const { json, jsonPath } = this.readJSONFile( // in IOHelper
        activityPath
      , [jsonName]
      )

      cancelled = !!json - 1 // 0 if json is valid, -1 if not

      if (!cancelled) {
        const toUpdate = this.get_IdOrUpdateConfirmation(
          jsonPath
        , activity
        )
        cancelled = !toUpdate

        if (!cancelled) {
          // ... and has been updated since the last call
          this.updateActivityData(
            contents
          , activity
          , activityPath
          , json
          , jsonPath
          , toUpdate
          )
        }
      }
    }

    this.logOperation(cancelled)
  }


  /** Checks if jsonName (root.json) exists. If not logs the error.
   *
   * @param  {array}   contents      Names of files at activityPath
   *                                 [ 'icon' | 'icon.img'
   *                                 , 'root.json'
   *                                 , <subfolder>, ...
   *                                 ]
   * @param  {string}  activityPath  absolute path to folder
   *
   * @return {bqolean} -1: cancelled  - an error occurred
   *                   +1: cancelled  - no update needed
   *                    0: successful - root.json rewritten and
   *                                    MongoDB collection updated
   */
  jsonIsMissing(contents, activityPath) {
    // console.log(contents)
    // contents:  [ 'basic', 'home', 'icon', 'root.json' ]

    if (!(contents.includes(jsonName))) {
      const message =
      `Error for ${this.activity} activity:
        The "${jsonName}" file is missing for
        ${activityPath}
        Available items: ${contents}
       `
      this.log(message)

      return -1
    }

    return 0
  }


  get_IdOrUpdateConfirmation(jsonPath, activityName) {
    const select = { key: activityName }

    const toUpdate = this.directoryNeedsUpdating( // in IOHelper
      jsonPath
    , Activity
    , select
    )

    /// *** Currently always returns true *** ?///

    return toUpdate
  }


  updateActivityData(
    contents
  , activity
  , activityPath
  , json
  , jsonPath
  , toUpdate
  ) {

    const jsxRegex = new RegExp(activity + ".jsx?")
    const modal = !contents.find( file => jsxRegex.test(file) )

    // console.log(contents, modal)

    this.updateJSONObject(activity,activityPath,json,contents,modal)
    // Both 'icon' and JSON file will have been removed from contents

    if (!modal) {
      this.writeToFileAndMongoDB(
        json
      , jsonPath
      , toUpdate
      )
    }
  }


  updateJSONObject (activity, activityPath, json, contents, modal) {
    const path = "/" + activity
    json.path  = path
    json.modal = modal

    // Create a placeholder icon if none exists, and remove the
    // icon data from contents
    json.icon = this.getIconMap(activityPath, contents)
  }


  /** Writes any new data to the JSON file and updates Activity
   *  collection with the new data and the mod date of the JSON file.
   *
   * NOTE: If a MongoDB collection was created and then later
   * dropped, _id will be `true`, but json._id will contain the
   * _id from the dropped collection. The new document will thus
   * adopt the previous _id.
   *
   * If, on the other hand, the JSON file has been edited to
   * remove its previously-created _id, but a MongoDB document
   * still exists for this activity, then _id will contain the
   * current _id string, and no duplicate document will be created.
   *
   * @param   {string}   jsonPath    absolute path to JSON file
   * @param   {object}   json        { "name": { localized strings }
   *                                 , "description": ditto
   *                                 , "icon": <url>
   *                                 , "key":  <string activity name>
   *                                [, "_id":  <string _id>]
   *                                 }
   * @param   {array}    contents    [ ..., icon(.xxg), ... ]
   * @param   {multi}    _id         true or _id string
   */
  writeToFileAndMongoDB(json, jsonPath, _id) {
    if (_id === true) {
      _id = json._id // may be undefined
    }

    // console.log("writeToFileAndMongoDB", JSON.stringify(json, null, "  "))

    if (!_id) {
      // Create a new document to get its _id...
      _id = Activity.insert( json )
      json._id = _id
      // ... then save the updated JSON file and update the new
      // document with the file's new mod date
      const mod = this.writeJSON(jsonPath, json)
      Activity.update({ _id }, { $set: { mod }})

    } else {
      // Save the _id to root.json and root.json's mod to MongoDB
      json._id = _id // it probably already has this value
      json.mod = this.writeJSON(jsonPath, json)
      Activity.update({ _id }, { $set: json }, {upsert: true})
    }
  }


  logOperation(cancelled, activityPath) {
    let message

    if (!cancelled) {
      message = `+++++++++++++
      Activity collection: update for ${this.activity} successful.
      `
    } else if (cancelled < 0) {
      // An error occured
      message = `-------------
      ACIVITY ${this.activity} NOT UPDATED.
      SEE ERROR MESSAGES ABOVE.
      `
    } else {
      // The JSON file has not been changed
      message = `=============
      Activity ${this.activity} not updated.
      This should be fine, but if you recently altered any asset
      files or icons, please touch or resave the JSON file at...
        ${activityPath}
      ...to change its modification date.      `
    }

    this.log(message)
  }
}
