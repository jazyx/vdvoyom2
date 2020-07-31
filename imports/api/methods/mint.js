/**
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
import * as assets from './assets'
import * as cloze from '../../public/Activities/Cloze/methods.js'
import * as drag from '../../public/Activities/Drag/methods.js'
import * as flash from '../../public/Activities/Flash/methods.js'
import * as spiral from '../../public/Activities/Spiral/methods.js'

export const methods = {
  ...admin
, ...assets
, ...cloze
, ...drag
, ...flash
, ...spiral
}
