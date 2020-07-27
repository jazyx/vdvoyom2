/**
 * /server/provision.js
 *
 * Reads all JSON files from the /private (assets) folder and
 * refreshes the associated collections in the MongoDB database
 * if the version numbers have increased.
 *
 * TODO: Adopt the `mod` system used by the ImportAssets classes so
 * that the version number can be removed.
 */

import CollectJSON from './collectJSON'

const fs = require('fs')
const path = require('path')


export default class Provision{
  constructor() {
    const knownFile   = "l10n.json"
    const privatePath = Assets.absoluteFilePath(knownFile)
                            .replace(knownFile, "")
    const jsonRegex = /.json$/
    const JSONfiles = this.crawl(privatePath, jsonRegex)

    JSONfiles.forEach(jsonFile => {
      new CollectJSON(jsonFile)
    })
  }

  /**
   * Adds to `list` all documents with the extension `type` found in
   * folder or any of its subfolders
   *
   * @param      {string}  folder   The folder to search in
   * @param      {string}  regex    /.json$/ or any regex to define a
   *                                file type
   * @param      {array}   list     An (empty) array
   * @return     {Array}            The input list, now populated with
   *                                absolute paths to files of the
   *                                given type
   */
  crawl( folder, regex, list=[] ) {
    const stats = fs.statSync(folder)

    if (stats.isDirectory()){
      const contents = fs.readdirSync(folder)

      contents.forEach(item => {
        const itemPath = path.join(folder, item)

        if (regex.test(itemPath)) {
          list.push(itemPath)

        } else {
          this.crawl( itemPath, regex, list )
        }
      })
    }

    return list
  }
}