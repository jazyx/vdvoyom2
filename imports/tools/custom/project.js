/**
 * /imports/api/tools/custom/project.js
 */



import { getRandomFromArray } from '../generic/utilities'
import { IMAGE_REGEX } from './constants'



const GOLDEN_ANGLE = 180 * (3 - Math.sqrt(5))
const RATIO        = 14221/512 // stretches 360 to 9999.140



export const getGoldenAngleAt = (index) => {
  let angle = index * GOLDEN_ANGLE
  angle -= Math.floor(angle / 360) * 360 // 0.0 ≤ angle < 360.0

  return angle
}



export const getCodeFrom = (angle) => {
  let code = Math.round(angle * RATIO)

  // The following lines depend on 0 ≤  code ≤ 9999, because of the
  // values of RATIO. If RATIO is multiplied by 10, for example,
  // we'll need an extra zero and an extra } else if { statement.

  if (code < 10) {
    code = "000" + code
  } else if (code < 100) {
    code = "00" + code
  } else if (code < 1000) {
    code = "0" + code
  } else {
    code = "" + code
  }

  return code
}



/** Returns an absolute path to a (localized) icon)
 *
 * @param   {object}  iconData   { src: "path/to/icon.xxg" }
 *                            OR { src: "path/to/icon/^0"
 *                               , icons: ["en.xxg", "fr.oog", ...]
 *                               }
 * @return  {string}   /path/to/icon.xxg OR /path/to/icon/en.xxg
 */
export const getIconSrc = (iconData, lang) => {
    let { src, icons } = iconData

    const languageMatch = (icons, lang) => {
      return icons.find(icon => {
        const match = IMAGE_REGEX.exec(icon)
        if (match && (match[1] === lang)) {
          return true
        }
      })
    }

    if (icons) {
      // src will be of the format "/path/to/icon/^0"
      let icon = languageMatch(icons, lang) // may be dialect xx-XX

      if (!icon) {
        // Use a generic language icon
        lang = lang.replace(/-.*$/, "") // "xx-XX" => "xx"
        icon = languageMatch(icons, lang)
      }

      if (!icon) {
        // An "en" icon was created automatically at startUp if it
        // didn't already exist. Use this language as a fallback.
        icon = languageMatch(icons, "en")
      }

      src = src.replace("^0", icon)
    }

    return src
  }