/**
 * /imports/api/methods/assets/ioHelper.js
 */


import { getColor    // for creating placeholder icons
       , removeFrom
       } from '../../../tools/generic/utilities'
import { PUBLIC_DIRECTORY
       , EN_REGEX
       , JSON_REGEX
       , ICON_REGEX
       } from '../../../tools/custom/constants'



const fs = require('fs')
const path = require('path')



// Used to generate icon.svg files in different colours
let number = 0



export default class IOHelper {
  constructor(log) {
    this.log = log
  }


  /** Compares mod date of JSON file with the MongoDB document
   *  associated with this file. Returns Boolean or string _id.
   *
   *  Called by ActivityInstaller.updateActivityRecordIfNeeded()
   *            ImportAssetFolder.treatFolder()
   *
   * @param   {string}   jsonPath    apsolute path to JSON file
   * @param   {object}   collection  MongoDB collection
   * @param   {object}   select      { _id: <> }
   *                                 { key: <activity name> }
   *
   * @return  {boolean}  > false      MongoDB mod is identical
   *                     > true       no MongoDB document exists
   *                     > string _id of out-of-date MongoDB document
   */
  directoryNeedsUpdating(jsonPath, collection, select) {
    // return true

    const stats   = fs.statSync(jsonPath)
    const mod     = stats.mtimeMs
    const options = { fields: { mod: 1 }}
    const doc     = collection.findOne(select, options)

    // console.log("directoryNeedsUpdating", jsonPath, doc)

    return true

    if (doc) {
      if (doc.mod === mod) {
        return false
      }

      return doc._id
    }

    return true
  }


  /**
   *
   * Called by ActivityInstaller.doActivityUpdate()
   *           ImportAssetFolder.treatFolder()
   *
   * @param  {string}   parentFolder  absolute path to parent folder
   * @param  {string[]} contents      names of items in folder
   *
   * @return {Object}   { jsonPath: <absolute path to json file>
   *                    , json:     { ... }
   *                    }
   */
  readJSONFile(parentFolder, contents) {
    const jsonFiles = contents.filter(
      file => JSON_REGEX.test(file)
    )

    // console.log(
    //   "readJSONFile"
    // , parentFolder
    // , contents
    // , JSON_REGEX
    // , jsonFiles
    // )

    if (jsonFiles.length !== 1) {
      const message =
      `ERROR in ImportAssetFolder ${this.activity}
      There should be one and only one JSON file:
        ${JSON.stringify(jsonFiles)}
      Aborting.`
      this.log(message)
      // console.log(message)
      return {}
    }

    // HACK: Remove JSON file from contents, as we don't want it
    // around when we start importing assets.
    removeFrom(contents, item => jsonFiles.includes(item), true)
    // console.log("contents after json removed:", contents)

    const jsonPath = path.join(parentFolder, jsonFiles[0])

    let json
    // try {
      json = fs.readFileSync(jsonPath)
      json = JSON.parse(json)

    // } catch(error) {
    //   const message =
    //   `Error reading JSON file ${jsonPath}:
    //   ${error}  `

    //   this.log(message)

    //   return {} // doc will not be updated
    // }

    // console.log("jsonPath:", jsonPath)
    // console.log("json:", json)

    return {
      jsonPath
    , json
    }
  }


  writeJSON(jsonPath, json) {
    // Remove the mod property from the JSON string, since it will
    // be obsolete as soon as the file is modified, and we will be
    // returning the new modification date to MongoDB

    if (Meteor.isDevelopment) {
      const replacer = (key, value) => ( key === "mod"
                                       ? undefined
                                       : value
                                       )
      const jsonString = JSON.stringify(json, replacer, '\t')

      fs.writeFileSync(jsonPath, jsonString)
    }
    const stats = fs.statSync(jsonPath)
    const mod = stats.mtimeMs

    return mod
  }


  /** Returns absolute path to icon, or short icon name, as asked
   *
   * Called by:
   * + importAll()        - deals with root Activity icon
   * + doActivityUpdate() - deals with icon at root of each activity
   * + treatFolder()      - deals with icon for each set
   *
   * @param  {string}    parentFolder  absolute path to parent folder
   * @param  {string[]}  contents      array of file short names
   *
   * @return {string}    relative path from /public/
   */
  getIconMap(parentFolder, contents) {
    const iconMap = {}

    let icons = contents.filter(file => ICON_REGEX.test(file))

    // HACK: Remove icon items from contents, as they will not be
    // required by importAssets
    removeFrom(contents, item => icons.includes(item), true)

    let icon
      , iconPath

    if (!icons.length) {
      icons.push(this._createPlaceholderIcon(parentFolder))
    }

    if (icons.includes("icon")) {
      // Use localized icons if they are provided.
      // Check that this icon folder contains an icon with the name
      // "en". Only files which share the same extension as the "en"
      // icon can be displayed.

      icon = "icon"
      iconPath = path.join(parentFolder, icon)
      icons = fs.readdirSync(iconPath)

      let enIcon = icons.filter(icon => EN_REGEX.test(icon))

      if (enIcon.length) {
        // enIcon = enIcon[0]
      } else {
        const message = `
        WARNING: Default icon ("en") not found at ${iconPath}
        Available icons: ${JSON.stringify(icons)}
        A placeholder en.svg will be used instead
        `
        this.log(message)

        icons.push(this._createPlaceholderIcon(iconPath, "en"))
      }

      iconPath += "/^0" // + extension
      iconMap.icons = icons

    } else {
      iconPath = path.join(parentFolder, icons[0])
    }

    iconMap.src = iconPath.replace(PUBLIC_DIRECTORY, "")

    return iconMap
  }


  /** Creates an SVG file in parentFolder; returns short file name
   *
   * Called by getIconMap()
   *
   * @param      {string}    parentFolder   absolute path to folder
   * @param      {string}    [name="icon"]  "en" | undefined
   *
   * @returns    {string}    "en.svg" | "icon.svg"
   */
  _createPlaceholderIcon(parentFolder, name="icon") {
    const iconName = name + ".svg"
    const colour = getColor({ number: number++, format: "hex" })
    const svg = `<?xml version="1.0"
  encoding="UTF-8"
  standalone="no"
?>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 400 400"
  height="400"
  width="400"
  fill="${colour}"
  stroke="none"
>
  <rect
    x="0"
    width="400"
    height="400"
    rx="80"
  />
</svg>`

    const iconPath = path.join(parentFolder, iconName)
    fs.writeFileSync(iconPath, svg)

    return iconName
  }
}