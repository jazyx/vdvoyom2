/**
 * /imports/tools/custom/teacher.js
 *
 * A singleton instance of the Teacher class is created by the App
 * component. This happens even when the user is not a teacher, in
 * which case the variable that holds the instance is cleared.
 *
 * When a teacher launches the app, and the app first shows the
 * Teach component, this singleton instance is initialized and the
 * teacher's device is added to the Teachers document's logged_in
 * field. Subsequent visits to the Teach view will have no effect;
 * there won't be multiple logged_in records for this device.
 *
 * When the user chooses a group in the Teach view, the `join` method
 * is called. This adds the Teachers device code to the Group
 * logged_in field. The withTracker() function in App.jsx constantly
 * checks if the teacher's d_code is the only entry in the Group's
 * logged_in field. If this happens, App will call leaveGroup, and
 * proactively display the Teach view.
 *
 * Logging the teacher out is handled without any reference to this
 * singleton instance.
 */


import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'

import { Session } from 'meteor/session'

import { methods } from '../../api/methods/mint'
const { logInTeacher, toggleActivation } = methods

import collections from '../../api/collections/publisher'
const { Group } = collections



class Teacher {

  initialize() {
    const id     = this.id     = Session.get("teacher_id")
    const d_code = this.d_code = Session.get("d_code")

    logInTeacher.call({ id, d_code })
  }


  // CALLS FROM <Teach /> COMPONENT

  restore() {
    if (!this.id) {
      this.initialize()
    }
  }


  join(group) {
    const { _id, path } = group

    Session.set("group_id", _id)

    toggleActivation.call({
      _id
    , d_code: this.d_code
    , active: true
    })
  }


  // CALL FROM App.jsx COMPONENT when props.emptyGroup is set to true

  leaveGroup() {
    // Remove this teacher's d_code from the Group logged_in array
    const _id    = Session.get("group_id")

    if (_id) {
      const d_code = this.d_code
      const active = false
      const options = {
        _id
      , d_code
      , active
      }

      toggleActivation.call(options)

      // We can unset the group_id Session variable already, because
      // the PointsClass tracker no longer needs it to remove the Points
      // record for this teacher.
      Session.set("group_id", undefined)
      delete Session.keys.group_id
    }
  }
}


export const teacher = new Teacher()