/**
 * /server/minters/activities.js
 */



const fs = require('fs')
const path = require('path')



export default class ActivityMinter {
  constructor(scripts) {
    /// <<< HARD-CODED
    let target = '../../imports/ui/activities/mint.js'
    /// HARD-CODED >>>

    target = path.join(process.env.PWD, __dirname, target)
    const chunks = this.getChunks(scripts)

    let script = this.getScriptChunk()
    script += chunks.imports
    script += chunks.names

    fs.writeFileSync(target, script)
    // '../../public/activities/Drag/js/Drag.jsx'
  }


  getChunks(scripts) {
    let imports = ""
    let names = ""

    scripts.forEach( script => {
      const { name, file } = script

      imports += `
import ${name} from '${file}'`

      names += `
, ${name}`
    })

    names = `

export {
 ${names.substring(2)}
}`

    return {
      imports
    , names
    }
  }


  getScriptChunk() {
    return `/**
 * ** DO NOT EDIT THIS SCRIPT **
 * IT IS GENERATED AUTOMATICALLY
 * EACH TIME THE SERVER RESTARTS
 *
 * MODIFY THIS FILE INSTEAD:
 * /server/minters/activities.js
 * **** **** **** **** **** ****
 *
 * This script gathers together details of all the <ActivityName>.jsx
 * scripts found in the '/public/activities/<ActivityName>/' folders.
 * JSX scripts which do not have the same name as the folder itself
 * will be ignored. They can still be used as secondary views by other
 * activity components.
 *
 * The classes exported here are imported as 'views' by
 * '/imports/ui/App.jsx'
 */
`
  }
}
