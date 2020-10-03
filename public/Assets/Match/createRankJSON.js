/**
 * /public/Assets/Match/test/createRankJSON.js
 *
 * Call...
 *
 *   node createRankJSON.js xxxx
 *
 * ... where xxxx is the name of the subfolder containing a topic
 *
 * This script generates a file named `rank.json` at the root of the
 * named subfolder. This file will have the format:
 *
 * {
 *   "set": {
 *     "tag": "test",
 *     "name": {
 *       "en": "Test"
 *     },
 *     "icon": {
 *       "src": "/Assets/Match/test/icon.jpg"
 *     },
 *     "path": "/Assets/Match",
 *     "parent": "/Assets"
 *   },
 *   "data": [
 *     {
 *       "matches": "James",
 *       "text": "James",
 *       "index": 0,
 *       "src": "/Assets/Match/James/cave.jpg"
 *     }
 *   , ...
 *   ]
 * }
 *
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * WARNING: When the Meteor app is relaunched, new entries will be
 * created in the Match collection for each object in the "" array,
 * and their _ids will be inserted into the rank.json document.
 *
 * Running this script after the Match collection is created will
 * remove those _ids. You should drop the Match collection first, or
 * remove all items with the given tag, otherwise duplicate entries
 * will be created.
 * vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
 */



"use strict"



const fs = require('fs')
const path = require('path')



class CreateJSON {
  constructor(parentName) {
    if (typeof parentName !== "string") {
      parentName = ""
    }

    this.assetFolder = this.getAssetFolder()
    const set = this.getSet(this.assetFolder, parentName)

    // console.log("set", set)

    // console.log("this.assetFolder:", this.assetFolder)

    this.parentName = parentName
    this.parentFolder = path.join(__dirname, parentName)
    if (!fs.existsSync(this.parentFolder)) {
      return console.log("Unknown folder:" + this.parentFolder)
    }

    this.getJSONEntry = this.getJSONEntry.bind(this)
    this.imageTypes = [
      ".jpg"
    , ".jpeg"
    , ".png"
    , ".gif"
    , ".svg"
    , "webm"
    ]
    // console.log("About to treat", this.parentFolder)

    const folders = fs.readdirSync(this.parentFolder)
                      .filter(folder => (
                        fs.lstatSync(
                          path.join(this.parentFolder, folder)
                        ).isDirectory()
                      ))

    // console.log(
    //   "folders"
    // , JSON.stringify(folders, null, "  ")
    // )

    const data = folders.map( this.getJSONEntry )
                        .filter( item => !!item )
                        .reduce(( output, array ) => {
                          Array.prototype.push.apply(output, array)
                          return output
                          }, [])
    const json = {
      set
    , data
    }
    // console.log(
    //   "json"
    // , JSON.stringify(json, null, "  ")
    // )

    const jsonString = JSON.stringify(json, null, "  ")
    const file = path.join(this.parentFolder, 'rack.json')
    fs.writeFileSync(
      file
    , jsonString
    , { encoding: 'utf8' }
    )

    console.log("File written to", file)
  }


  getAssetFolder() {
    const pwd = __dirname
    const regex = /\/public(\/Assets\/(\w+))/


    // console.log(pwd, regex)


    const match = regex.exec(__dirname)
    if (match) {
      return match[1]
    }
  }


  getSet(assetPath, parentName) {
    let parent = "/" + assetPath.split("/")[1]
    let name =parentName[0].toUpperCase() + parentName.substring(1)
    let src = path.join(assetPath, parentName, "icon.jpg")

    return {
      "tag": parentName
    , "name": {
        "en": name
      }
    , "icon": {
        src
      }
    , path: assetPath
    , parent
    }
  }


  getJSONEntry(folderName) {
    const folderPath = path.join(this.parentFolder, folderName)
    let contents = fs.readdirSync(folderPath)
                       .filter( file => (
                         this.imageTypes.indexOf(path.extname(file)) > -1
                       ))

    if (contents.length > 1) {
      contents = contents.map(( fileName, index ) => ({
        matches: folderName
      , text: folderName
      , index
      , src: path.join(this.assetFolder, folderName, fileName)
      }))
    } else {
      contents = false
    }

    return contents
  }
}




const folderName = process.argv[2]
new CreateJSON(folderName)

// {
//     _id:     "randomcharactersandnumbers"
//   , tag:     "parent_folder_name"
//   , matches: "folder_name"
//   , text:    "" | "text to show"
//   , index:   0 | 1 | ...
//   , src:     <url>
// }
//
  // {
  //   "tag": "test",
  //   "matches": "James",
  //   "text": "James",
  //   "index": 1,
  //   "src": "/Assets/Match/James/step.jpg"
  // }