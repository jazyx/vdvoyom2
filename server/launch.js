/**
 * /server/launch.js
 */



import Provision from './provision'

import ImportAssets from '../imports/api/methods/assets/importAssets'
import ImportActivities from './importActivities'



// Update the UIText and Teacher collections, as needed
new Provision()

// Update the various activity collections, as needed
new ImportAssets()
new ImportActivities()