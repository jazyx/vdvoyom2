/**
 * /server/minters/methods.js
 */



const fs = require('fs')
const path = require('path')



export default class MethodMinter {
  constructor(methods) {
    /// <<< HARD-CODED
    let target = '../../imports/api/methods/mint.js'
    /// HARD-CODED >>>

    target = path.join(process.env.PWD, __dirname, target)
    const scriptChunks = this.getScriptChunks()
    const importChunks = this.getImportChunks(methods)

    let script = scriptChunks[0]
    script += importChunks.imports

    script += scriptChunks[1]
    script += importChunks.names

    script += scriptChunks[2]

    fs.writeFileSync(target, script)
  }


  getImportChunks(methods) {
    let imports = ""
    let names = ""

    methods.forEach( method => {
      let { name, file } = method
      name = name.toLowerCase()

      imports += `
import * as ${name} from '${file}'`

      names += `
, ...${name}`
    })

    return {
      imports
    , names
    }
  }


  getScriptChunks() {
    return [`/**
 * /imports/api/methods/mint.js
 *
 * ** DO NOT EDIT THIS SCRIPT **
 * IT IS GENERATED AUTOMATICALLY
 * EACH TIME THE SERVER RESTARTS
 *
 * MODIFY THIS FILE INSTEAD:
 *  /server/minters/methods.js
 * **** **** **** **** **** ****
 *
 * This script gathers together details of all the methods
 * from './admin.js' and the various methods.js files found
 * in the '/public/activities/<ActivityName>/' folders.
 *
 * The methods exported here are imported by '/server/main.js'
 * and various client-side scripts.
 */

import * as admin from './admin'
import * as assets from './assets'`
,`

export const methods = {
  ...admin
, ...assets`
,`
}
`
    ]
  }
}