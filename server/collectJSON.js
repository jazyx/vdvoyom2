/**
 * /server/collectJSON.js
 */


// The following file will be rewritten on Meteor.startup(). When new
// modules are added, the existing contents of this file will be
// read in BEFORE the files are rewritten to include the collection
// and methods used by the new modules. In other words, during
// development, the server will need to be restarted twice (once
// automatically and once manually).
import collections from '../imports/api/collections/publisher'

const fs = require('fs')
const path = require('path')


/**
 * @class  CollectJSON (name)
 *
 * A CollectJSON instance expects to receive a path to afile either
 * in the /public or the /private folder. This path should lead to a
 * JSON file, with the format shown in the _treatJSON method.
 *
 * • The value of collection should be one of the capitalized
 *   collection names defined in AppName/imports/api/collection.js
 * • An as_is object with at least a version number must be included
 * • If the version indicated in the `as_is` entry is greater than the
 *   version number currently stored in the given collection, all the
 *   existing values will be removed and will be replaced by the
 *   new ones.
 */
export default class CollectJSON {
  constructor (jsonFile) {
    this.jsonFile = jsonFile
    // console.log("CollectJSON", jsonFile)

    this._treatJSON = this._treatJSON.bind(this)
    this._checkResult = this._checkResult.bind(this)

    // Assets.getText(jsonFile, this._treatJSON)
    try {
      const data = fs.readFileSync(jsonFile)
      this._treatJSON(null, data)

    } catch(error) {
      console.log("Error reading", jsonFile, error)
    }
  }

  _treatJSON(error, data) {
    if (error) {
      return console.log("_treatJSON", error)
    }

    let json
    try {
      json = JSON.parse(data)
    } catch(error) {
      return console.log("JSON.parse\n", this.jsonFile, "\n", error)
    }

    // console.log(json)
    // { "collection": "Collection" // target for new documents
    //
    // , "as_is": { // document will be added as is
    //     "version": <number>
    // [ , "key"|"tag": "<type of documents to be added>" ]
    //   , ...
    //   }
    //
    // , "<type>: [         // each entry will be added as a separate
    //                      // document with the type "<type>" and
    //                      // the version <as_is.version>
    //     { "<key>": "<value>"
    //     , ...
    //     }
    //   , ...
    //   ]
    // ]

    const collection = collections[json.collection]
    if (!collection) {
      console.log("Collection", json.collection)
      return console.log("missing for", this.jsonFile)
    }

    delete json.collection

    const version = this._versionIsNewer(collection, json.as_is)
    // console.log("version:", version, json.collection, json.as_is)
    if (version) {
      const key = json.as_is.key // CollectionName | Subset
      const tag = json.as_is.tag // image type
      this._deleteOlderItems(collection, key, tag, version)
      this._insertNewItems(collection, json, version)
    }
  }


  _versionIsNewer(collection, as_is) {
    let key
      , tag
      , version

    // Refuse to import documents unless:
    // * There is an as_is object...
    // * ... which contains a non-zero version
    if (!as_is || typeof as_is !== "object") {
      return false
    } else if (!(version = as_is.version)) {
      return false
    }

    // Check the existing version number for this particular key or
    // tag, as added from a previous as-is document.
    let versionSelect = { version: { $exists: true }}
    if (key = as_is.key) {
      versionSelect = {
        $and: [
          versionSelect
        , { key }
        ]
      }
    } else if (tag = as_is.tag) {
      versionSelect = {
        $and: [
          versionSelect
        , { tag }
        ]
      }
    }
    const document = collection.findOne(versionSelect)
    // console.log("**",collection._name)

    if (document) {
      if (version <= document.version) {
        return false

      } else {
        console.log(
          "Older version", document.version
        , "of", key||tag||collection._name, "is about to be removed"
        , "and replaced with version", version)
      }
    }

    return version
  }


  _deleteOlderItems(collection, key, tag, version) {
    let deleteSelect = { version: { $lt: version } }

    if (key) {
      deleteSelect = {
       $and: [
          deleteSelect
        , { key }
        ]
      }

    } else if (tag) {
      deleteSelect = {
       $and: [
          deleteSelect
        , { $or: [
              { tag }                // deletes as_is entry
            , { type: { $eq: tag }}  // deletes all associated images
            ]
          }
        ]
      }
    }

    const collectionName = key || collection._name
    const callback = (e, d) => this._checkResult(e, d, collectionName)
    collection.remove(deleteSelect, callback)
  }


  _insertNewItems(collection, json, version) {
    const keys = Object.keys(json)
    let counter = 0

    keys.forEach(key => {
      const value = json[key]

      if (Array.isArray(value)) {
        value.forEach(document => {
          document.type = key
          document.version = version
          collection.insert(document)
          counter += 1
        })

      } else if (key === "as_is") {
        collection.insert( value )
        counter += 1

      } else { // Use with caution. Old documents will not be cleared.
        collection.insert({ [key]: value })
         counter += 1
      }
    })

    console.log("Added", counter, "items to", collection._name)
  }


  _checkResult(error, data, key) {
    console.log("Removed", data, "items from", key, "error:", error)
  }
}
