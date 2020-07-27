/**
 * /imports/api/methods/admin/account.js
 */


import { hsl2hex } from '../../../tools/generic/utilities'
import { getGoldenAngleAt
       , getCodeFrom
       } from '../../../tools/custom/project'

import collections from '../../collections/publisher'
const { User, Teacher, Group } = collections



export default class CreateAccount {
  constructor(accountData) {
    this.accountData = accountData
    // console.log("CreateAccount accountData:", accountData)

    /// <<< HARD-CODED
    this.saturation = 60
    this.luminosity = 50
    // accountData.path = []
    /// HARD-CODED >>>

    this.createUniqueQCode()
    this.createUser()

    accountData.accountCreated = true
    accountData.status = "CreateGroup"

    // console.log("accountData after createUser:", accountData)
    // console.log("————————————————————————————")
    //
    // d_code: "HABIg"
    // native: "en-GB"
    // q_code: "3819"
    // q_color: "#33cc60"
    // q_index: 1
    // status: "CreateAccount"
    // user_id: "DcMNnhN7meZ7hmSr4"
    // username: "James"
    // path:  []
    //
    // = username:   "Влад"
    // = teacher:    "jn"
    // = d_code:     "d9Uvl"
    // + q_code:     "0381"
    // + user_id:    "BqKkMjjBSRzedasyT"
    // + group_id:   "PWwknSiHCGmsivSXg"
    // + newAccount: true
    // + path:       []
    //
    // // Not needed in the return value
    // = language:   "en-GB"
    // = native:     "ru"
    // + q_color:    "#33cc60"
    // + q_index:    1
    // + logged_in:   []

    const notNeeded = [
      "language"
    , "native"
    , "q_color"
    , "q_index"
    , "logged_in"
    ]

    notNeeded.forEach(key => {delete accountData[key]})
  }


  createUniqueQCode() {
    // Create or recyle a number between 0001 and 9999

    let newest  = User.findOne(
      {}
    , { fields: { q_index: 1 }
      , sort: { q_index: -1 }
      }
    )

    let q_index = newest
                ? newest.q_index + 1
                : 1
    let hue
      , q_code
      , q_color

    if (q_index < 6765) {
      // Use the Golden Angle to get the next value
      hue = getGoldenAngleAt(q_index)
      q_code = getCodeFrom(hue)

    } else if (q_index < 8901) {
      // TODO: Use the Golden Angle, but check for duplicate q_code's

    } else if (q_index < 10000) {
      // TODO: Find a gap in the index numbers

    } else {
      // TODO: We can't have more than 9999 unique q_codes. Find the
      // User with a name different from this.accountData.username
      // who logged in last the longest time ago, archive that User
      // record and reuse that User's q_index and q_code. The q_color
      // will be reset below.
    }

    q_color = hsl2hex(hue, this.saturation, this.luminosity)

    this.accountData.q_index = q_index
    this.accountData.q_code  = q_code
    this.accountData.q_color = q_color
  }


  createUser() {
    const {
      username
    , native
    , q_index
    , q_code
    , q_color
    , d_code
    } = this.accountData

    const fields = {
      username
    , native
    , q_index
    , q_code
    , q_color
    }
    fields.history = {}
    fields.logged_in = []

    // console.log("createUser accountData = ", this.accountData)

    this.accountData.user_id  = User.insert(fields)
  }
}