/**
 * /imports/api/methods/assets/import.js
 *
 *
 */



import '../mint'

import Log from './log.js'
import IOHelper from './ioHelper'

import { removeFrom } from '../../../tools/generic/utilities'

import { PUBLIC_DIRECTORY
       , ASSETS_FOLDER
       , IMAGE_REGEX
       , JSON_REGEX
       } from '../../../tools/custom/constants'

import collections  from '../../collections/publisher.js'



const fs = require('fs')
const path = require('path')



export default class ImportAssets extends IOHelper{
  constructor(options) {
    super()

    this.logger = new Log()
    this.log = this.logger.addEntry

    if (typeof options === "object") {
      const { zipFile, parentFolder } = options

      if (parentFolder) {
        const activity = this.getActivityNameFrom(parentFolder)
        if (activity) {
          this.installAssets(zipFile, parentFolder, activity)
        }
      }

    } else  { // the call came from launch.js
      this.importSubfoldersOf(ASSETS_FOLDER)
    }

    this.logger.save()
  }


  /** TODO: TEST WITH CUSTOM IMPORT
   *
   * @return  {string}  The activity name from parent folder path.
   */
  getActivityNameFromParentFolderPath() {
    // public/activities/<ActivityName>/assets/...
    const regex = /\/public\/Activities\/(\w+)/
    const match = regex.exec(this.parentFolder)
    if (match) {
      const activityName = match[1]
      if (activityName) {
        return activityName
      }
    }
  }


  installAssets(activity, zipFile, parentFolder) {
    // TODO: unzip zipFile
    const subFolders = fs.readdirSync(parentFolder)
    this.treatFolder(activity, parentFolder, subFolders)
  }


  /**
   * Called by constructor if no options are given, and recursively
   *
   * @param  {string}  folder              absolute path to
   *                                       ASSETS_FOLDER or one of its
   *                                       immediate children
   * @param  {undefined|string}  activity  undefined when first called
   *                                       then the name of one of the
   *                                       items in folder
   */
  importSubfoldersOf(folder, activity) {
    const exploreSubFolders = !activity
    const contents = fs.readdirSync(folder)

    // console.log("importSubfoldersOf", folder, activity)
    // console.log(contents)
    // [ 'Cloze', 'Nim', 'Spiral', 'Vocabulary' ]

    contents.forEach( subFolder => {
      const parentFolder = path.join(folder, subFolder)
      if (fs.lstatSync(parentFolder).isDirectory()) {
        const subFolders = fs.readdirSync(parentFolder)

        // console.log("subfolders of",parentFolder, subFolders)

        const hasJSON = subFolders.find(item => JSON_REGEX.test(item))
        if (hasJSON) {
          if (!activity) {
            activity = subFolder
          }
          this.treatFolder(activity, parentFolder, subFolders)

        } else if (exploreSubFolders) {

          this.importSubfoldersOf(parentFolder, subFolder)

        } else {
          const message =`No JSON found: items ignored in ${parentFolder}`
          this.log(message)
          console.log(message)
        }
      }
    })
  }


  /** If no errors, updates JSON and MongoDB where JSON has changed
   *  crawling any subfolders from branch to leaf recursively.
   *
   * Called by:
   * + ImportAssets.installAssets       < specific folder
   * +             .treatActivityFolder < all activities, from root
   *
   * —— Three types of input ——
   *
   * Standalone
   * ==========
   * activity:     "Nim"
   * parentFolder: '..../public/activities/Nim'
   * contents:     [ 'audio', 'image', 'l10n.json' ]
   *
   * Branch
   * ======
   * activity:     "Vocabulary"
   * parentFolder: '..../public/activities/Vocabulary'
   * contents:     [ 'icon.jpg', 'rank.json', 'home', 'basic' ]
   *
   * Leaf
   * ====
   * activity:     "Vocabulary"
   * parentFolder: '..../public/activities/Vocabulary/basic'
   * contents:     [ 'audio', 'icon.jpg', 'image', 'rack.json' ]
   */
  treatFolder(activity, parentFolder, contents) {
    const { jsonPath, json } = this.readJSONFile(
      parentFolder
    , contents
    )

    if (!json) {
      // An error will already have been logged
      return -1
    }

    const localPath  = this.getLocalPath(parentFolder)
    const collection = collections[activity]
    const select     = { localPath }

    // console.log("treatFolder", activity, path)
    const toUpdate = this.directoryNeedsUpdating( // now returns true
      jsonPath
    , collection
    , select
    )

    if (!toUpdate) {
      const message =`        Set is up-to-date: ${localPath}`
      this.log(message)
      return 1 // JSON hasn't changed
    }

    // Creates an icon if there is none, even if none is needed
    const icon = this.getIconMap(parentFolder, contents)

    if (contents.includes('audio') || contents.includes('image')) {
      const message =`        Adding phrases from: ${localPath}`
      this.log(message)

      return this.addPhraseSet(
        parentFolder
      , contents
      , icon
      , localPath
      , jsonPath
      , json
      , collection
      )

    } else {
      const message =`        Adding assets from: ${localPath}`
      this.log(message)

      // console.log(message)

      this.crawlSubFolders(
        parentFolder
      , contents
      , icon
      , localPath
      , jsonPath
      , json
      , collection
      , activity
      )
    }
  }


  addPhraseSet(
      parentFolder
    , contents
    , icon
    , localPath
    , jsonPath
    , json
    , collection
    ) {

    const assets = {
      audio: {}
    , image: {}
    , icon
    }

    // Add audio and image assets
    this.crawlAudioFolder(parentFolder, contents, assets.audio)
    this.crawlImageFolder(parentFolder, contents, assets.image)

    const cancelled = this.treatJSON( // cancel if tag present+invalid
      localPath
    , jsonPath
    , json
    , collection
    , assets
    )

    return cancelled
  }


  /** Returns a string like "/Activity/folder/.../exercise"
   *  which is a version of parentFolder from which the path
   *  to the `.../public/Activities/` folder has been
   *  trimmed. There should be no trailing "/"
   *
   * @param    {string}    parentFolder  absolute path to parent
   * @return   {string}    like '/Activity/folder/.../exercise'
   */
  getLocalPath(parentFolder) {
    const localPath = parentFolder.replace(ASSETS_FOLDER, "/")

    return localPath
  }


  crawlAudioFolder(parentFolder, contents, audioMap){
    let audio = "audio"
    if (!contents.includes(audio)) {
      return
    }

    audio = path.join(parentFolder, audio)
    contents = fs.readdirSync(audio)
    // console.log("audio/ contents:", contents)
    // audio/ contents: [ 'ru' ]

    contents.forEach( folder => {
      this.crawlAudioSubFolder(audio, folder, audioMap)
    })
  }


  crawlAudioSubFolder(audioFolder, lang, audioMap) {
    const folderPath = path.join(audioFolder, lang)
    const contents = fs.readdirSync(folderPath)
    // console.log("audio/" + lang + "/ contents:", contents)
    // audio/ru/ contents: [ '01.mp3', '02.mp3', '03.mp3', ... ]

    // Assume that all audio files will be in MP3 format. Any
    // file that does not have the MP3 format may be a folder
    // with additional audio assets for a given phrase.
    //
    // TODO: Deal with additional audio assets
    // TODO: Add credits and transcription data from json file

    contents.forEach(file => {
      const extension = path.extname(file)

      if (extension.toLowerCase() === ".mp3") {
        let src = path.join(folderPath, file)
        const stats = fs.statSync(src)
        const size = stats.size
        src = src.replace(PUBLIC_DIRECTORY, "")

        let fileName = path.basename(file, extension)
        if (!isNaN(fileName)) {
          // Remove any leading zeros
          fileName = "" + parseFloat(fileName)
        }

        const phraseAudio = audioMap[fileName]
                         || ( audioMap[fileName] = {} )
        const localized   = phraseAudio[lang]
                         || ( phraseAudio[lang] = [] )

        localized.push({
          src
        , size
        })

      } else {
        // TODO: Deal with additional audio assets
      }
    })
  }


  crawlImageFolder(parentFolder, contents, imageMap) {
    let image = "image"
    if (!contents.includes(image)) {
      return
    }

    const folderPath = path.join(parentFolder, image)
    contents = fs.readdirSync(folderPath)
    // console.log("image/ contents:", contents)
    // image/ contents: [ 03.gif','04.png','1.jpg','20.png' ...]

    contents.forEach(file => {
      if (IMAGE_REGEX.test(file)) {
        let src = path.join(folderPath, file)
        const stats = fs.statSync(src)
        const size = stats.size
        src = src.replace(PUBLIC_DIRECTORY, "")

        const extension = path.extname(file)
        let fileName = path.basename(file, extension)

        if (!isNaN(fileName)) {
          // Remove any leading zeros
          fileName = "" + parseFloat(fileName)
        }

        const phraseImages = imageMap[fileName]
                          || ( imageMap[fileName] = [] )

        phraseImages.push({
          src
        , size
        })

      } else {
        // TODO: Deal with additional image assets
      }
    })
  }


  /** Check for valid tag; update MongoDB set (+ phrases); save JSON
   *
   * Called by treatFolder() if JSON file was updated
   *
   * @param    {string}  localPath   "/Activity/folder/.../exercise"
   * @param    {string}  jsonPath    absolute path to JSON file
   * @param    {object}  json        object read from JSON file
   * @param    {object}  assets      { audio: {}
   *                                 , image: {}
   *                                [, icon:  <string>]
   *                                 }
   * @param    {object}  collection  MongoDB collection
   *
   * @return   {number}  -1: tag value in json or json.set invalid
   *                      0: set document (and phrase documents)
   *                         successfully updated, JSON saved
   */
  treatJSON(localPath, jsonPath, json, collection, assets, activity) {
    const set = json.set || json
    let { tag, ignore_missing_files } = set
    let addPhrases = false
    let phrases

    if (tag) { // should be string, string[] or select object
      if (typeof tag === "string") {
        tag = [ tag ]
        addPhrases = true

      } else if (Array.isArray(tag)) {
        tag = tag.filter( item => typeof item === "string" )
        addPhrases = tag.length

      } else if (typeof tag === "object") {
        // TODO: Check that this is a valid selector object
        // Allow the set to be added, but don't add any phrases

      } else {
        // tag exists but is invalid
        const message = `ERROR in activity ${activity}
        Invalid tag found in file at
        ${jsonPath}
        No set treated, no phrases updated.
        `
        this.log(message)
        return -1
      }
    }

    const select = { path: localPath }
    const toUpdate = this.directoryNeedsUpdating(
      jsonPath
    , collection
    , select
    )
    this.getSet(set, localPath, assets.icon, collection, toUpdate)
    // Creates a record in collection and retrieves its _id if
    // no record exists yet: set._id will now exist

    // console.log("treatJSON addPhrases:", addPhrases)
    // console.log(json.phrases)

    if (addPhrases && (phrases = json.phrases)) {
      // Update json with details of available assets
      this.addAssetsToPhrases(
        phrases
      , assets
      , tag
      , ignore_missing_files
      )
    } else {
      phrases = json.data || []
    }

    // Insert or update phrase documents in MongoDB
    this.treatPhrases(phrases, collection)
    // Each phrase will now have its own _id

    const mod = this.writeJSON(jsonPath, json)

    collection.update({ _id: set._id }, { $set: { mod }})

    return 0 // not cancelled
  }


  getSet(set, localPath, icon, collection, _id) {
    if (_id === true) {
      _id = set._id
    }

    if (icon) {
      set.icon = icon
    }

    set.path = localPath
    const parent = localPath.split("/")
    parent.pop()
    set.parent = parent.join("/")

    if (_id) {
      collection.update({ _id }, set, { upsert: true })

    } else {
      _id = collection.insert(set)
      set._id = _id
    }
  }


  addAssetsToPhrases(phrases,assets,tagArray,ignore_missing_files) {
    const audio = assets.audio
    const image = assets.image || {}

    // console.log("addAssetsToPhrases image:", image)

    phrases.forEach( phraseData => {
      let name = phraseData.name
      let phrase = phraseData.phrase

      // Some activities have no "phrase" entry (e.g. Spiral)
      // As a result, they don't have any audio either
      const hasPhrases = (typeof phrase === "object")
      const languages = hasPhrases
                      ? Object.keys(phrase)
                      : [ "ignore_phrase" ]
      const lang = languages[0]

      if (!isNaN(name)) {
        name = "" + parseFloat(name)
      }

      let files
      if (hasPhrases) {
        files = audio[name]
        if (files) {
          phraseData.audio = files

          if (!ignore_missing_files) {
            const missingLanguages = this.getMissing(languages, files)
            if (missingLanguages) {
              this.log("Missing       LANG  for phrase "
                      + phraseData.name
                      + ": " + JSON.stringify(missingLanguages)
                      + " \"" + phrase[lang] + "\""
                      )
            }
          }

        } else if (!ignore_missing_files) {
          this.log("Missing       audio for phrase "
                  + phraseData.name
                  + ":        \"" + phrase[lang] + "\""
                  )
        }
      } else {
        // Provide a placeholder phrase with a `lang` entry, in case
        // the image is missing
        phrase = { "ignore_phrase": "" }
      }

      files = image[name]
      if (files) {
        phraseData.image = files
      } else if (!ignore_missing_files) {
        this.log( "Missing image       for phrase "
                + phraseData.name
                + ":        \"" + phrase[lang] + "\""
                )
      }

      phraseData.tags = [ ...(phraseData.tags || []), ...tagArray ]
                        .filter(( tag, index, array) => (
                          array.indexOf(tag) === index
                        ))
    })
  }


  getMissing(languages, files) {
    const available = Object.keys(files)
    const missing = languages.filter( lang => (
      !available.includes(lang)
    ))

    if (!missing.length) {
      return 0
    }

    return missing
  }


  treatPhrases(phrases, collection) {
    phrases.forEach( phraseData => {
      let { _id } = phraseData

      if (_id) {
        collection.update({ _id }, phraseData, { upsert: true } )

      } else {
        _id = collection.insert( phraseData )
        phraseData._id = _id
      }
    })
  }


  crawlSubFolders(
        parentFolder
      , subFolders
      , icon
      , localPath
      , jsonPath
      , json
      , collection
      , activity
      ) {

    // console.log("crawlSubFolders:",parentFolder)
    // console.log(subFolders)

    // Treat rank.json files
    const jsonFiles = subFolders.filter(item => JSON_REGEX.test(item))
    removeFrom(subFolders, item => jsonFiles.includes(item), true)

    this.treatJSON(localPath, jsonPath, json, collection, { icon }, activity)

    subFolders.forEach(folder => {
      folder = path.join(parentFolder, folder)

      // try {
        const contents = fs.readdirSync(folder)
        this.treatFolder(activity, folder, contents)

      // } catch(error) {
      //   const message = `<<<<<<*>>>>>>
      //   ERROR trying to import asset folder for ${activity}
      //   ${error}
      //   `
      //   this.log(message)
      // }
    })
  }
}