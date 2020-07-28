/**
 * /server/setup.js
 */


import MethodMinter from './minters/methods'
import ActivityMinter from './minters/activities'
import CollectionMinter from './minters/collections'
import { ICON_REGEX } from '../imports/tools/custom/constants'



const fs = require('fs')
const path = require('path')



export default class SetUp{
  constructor() {
    this.publicPath  = "../../public/"
    this.browserPath = "../web.browser/app/"

    this.findActivities("Activities")
    this.getAssets("Assets")
  }


  findActivities(folder) {
    const activities = []

    const activityPath = path.join(this.browserPath, folder)
    const activityNames = fs.readdirSync(activityPath)

    activityNames.forEach(name => {
      if (name !== "shared") {
        const directory = path.join(activityPath, name)
        const stats = fs.statSync(directory)

        if (stats.isDirectory()){
          const activityData = this.getJSData(name, directory)

          if (activityData) {
            activities.push(activityData)

          } else {
            console.log("Ignoring module:", name)
          }
        }
      }
    })

    this.mintScripts(activities)
  }


  getJSData(name, folder) {
    let data
    const contents = fs.readdirSync(folder)
    const keys = contents.map(file => {
      const baseName = path.basename(file, path.extname(file))

      if (baseName.toLowerCase() === name.toLowerCase()) {
        return "script"

      } else {
        return baseName
      }
    })

    if (keys.includes("script") || keys.includes("methods")) {
      data = keys.reduce((map, key, index) => {
        let file = path.join(folder, contents[index])
                       .replace(this.browserPath, this.publicPath)
        map[key] = {
            name
          , file
          }

        return map
      }, {})

      return data
    }
  }


  getAssets(folder) {
    const collections = []

    const assetsPath = path.join(this.browserPath, folder)
    const assetNames = fs.readdirSync(assetsPath)

    assetNames.forEach(name => {
      // Ignore any folders (such as `shared`) with lowercase names
      if (name.toLowerCase() !== name) {
        const directory = path.join(assetsPath, name)
        const stats = fs.statSync(directory)

        if (stats.isDirectory()){
          collections.push(name)
        }
      }
    })

    new CollectionMinter(collections)
  }


  mintScripts(activities) {
    const scripts  = []
    const methods  = []

    activities.forEach( activity => {
      if (activity.script) {
        // Will be missing for modal activities
        scripts.push(activity.script)
      }
      if (activity.methods) {
        // May be missing for extended activities
        methods.push(activity.methods)
      }
    })

    new MethodMinter(methods)
    new ActivityMinter(scripts)
  }
}

