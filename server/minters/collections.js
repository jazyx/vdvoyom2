/**
 * /server/minters/collections.js
 */



const fs = require('fs')
const path = require('path')



export default class CollectionMinter {
  constructor(collections) {
    /// <<< HARD-CODED
    let target = '../../imports/api/collections/mint.js'
    /// HARD-CODED >>>

    target = path.join(process.env.PWD, __dirname, target)
    const scriptChunks = this.getScriptChunks()
    const importChunks = this.getImportChunks(collections)

    let script = scriptChunks[0]
    script += importChunks.creations

    script += scriptChunks[1]
    script += importChunks.names

    script += scriptChunks[2]
    script += importChunks.queries

    script += scriptChunks[3]

    fs.writeFileSync(target, script)
  }


  getImportChunks(collections) {
    // let imports   = ""
    let creations = ""
    let names     = ""
    let queries   = ""

    collections.forEach( name => {
      // if (collection) {
      //   const { name, file } = collection
      //   const query=name[0].toLowerCase()+name.substring(1)+"Query"
      //   imports += `
      // import { ${name}
      //  , publishQuery as ${query}
      //  } from '${file}'`

      creations += `
const ${name} = new Mongo.Collection('${name.toLowerCase()}')`

      names += `
, ${name}`

      //        queries += `
      // , "${name}": ${query}`
      // -      }

      queries += `
, "${name}": {}`
    })

    return {
      creations
    , names
    , queries
    }
  }


  getScriptChunks() {
    return [`/**
 * ** DO NOT EDIT THIS SCRIPT **
 * IT IS GENERATED AUTOMATICALLY
 * EACH TIME THE SERVER RESTARTS
 *
 * MODIFY THIS FILE INSTEAD:
 * /server/minters/collections.js
 * **** **** ********** **** ****
 *
 * This script creates a MongoDB collection named after each of the
 * folders found at '/public/collections/'.
 *
 * The collections and publish queries exported here are
 * imported by './publisher.js', which publishes them all.
 */



import { Mongo } from 'meteor/mongo';
import { collections as adminCollections
       , publishQueries as adminQueries
       } from './admin'

`,
`


export const collections = {
  ...adminCollections`,
`
}


export const publishQueries = {
  ...adminQueries`,
`
}`
]
  }
}