/**
 * /public/Assets/Match/test/createRankJSON.js
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

    console.log("set", set)

    console.log("this.assetFolder:", this.assetFolder)

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
    console.log("About to treat", this.parentFolder)

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
    , "phrases": data
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
  }


  getAssetFolder() {
    const pwd = __dirname
    const regex = /\/public(\/Assets\/(\w+))/


    console.log(pwd, regex)


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