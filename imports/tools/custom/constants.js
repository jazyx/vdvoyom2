/**
 * /imports/tools/custom/constants.js
 *
 * The constants below are used by other scripts in the
 * /imports/api/methods/assets/ folder
 */



import { Meteor } from 'meteor/meteor'



const PWD = process.env.PWD
// Development: /home/blackslate/Repos/jazyx/Activities
// Production:  /var/www/jazyx/<subdomain>/bundle

const formats = "jpe?g|png|svg|gif|webm)"  // trailing ) deliberate
const lookAhead = "\\.(?:" + formats + "$" // leading ( only

/// <<< HARD-CODED
const SPLASH_DELAY     = 1 // * 1000
const STARTUP_TIMEOUT  = 10 * 1000 * 10000
const PUBLIC_DIRECTORY = Meteor.isDevelopment
                       ? PWD + "/public"
                       : PWD + "/programs/web.browser/app"

const ACTIVITY_FOLDER = PUBLIC_DIRECTORY + '/Activities/'
const ASSETS_FOLDER = PUBLIC_DIRECTORY + '/Assets/'

const ICON_REGEX = new RegExp("^(icon" + lookAhead + ")|(icon)$")
// Used to find default icon in /icon/ folders: /icon/en.xxx
const EN_REGEX = new RegExp("en\.(" + formats)
// Used to identify image files in image/ folder
const IMAGE_REGEX = new RegExp("([^/.]+)" + lookAhead)
// Breaks "before [link](url) after" into four chunks
const LINK_REGEX = /(.*)(?:\[([^\]]+)]\(([^)]+)\))(.*)|(.*)/
// four-letter + .json
const JSON_REGEX = /^((?:root)|(?:rank)|(?:rack)|(?:l10n))\.json$/
// Splits PATH_REGEX into chunks like "/Activity" and "/exercise"
const SET_REGEX = /(?=\/)/

const NO_AUDIO_DELAY = 1500
/// HARD-CODED >>>



export {
  SPLASH_DELAY
, STARTUP_TIMEOUT

, PUBLIC_DIRECTORY
, ACTIVITY_FOLDER
, ASSETS_FOLDER

, ICON_REGEX
, IMAGE_REGEX
, LINK_REGEX
, JSON_REGEX
, SET_REGEX
, EN_REGEX

, NO_AUDIO_DELAY
}