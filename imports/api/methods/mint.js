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
import * as show from '../../public/Activities/Show/methods.js'

export const methods = {
  ...admin
, ...assets
, ...show
}
