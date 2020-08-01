/**
 * imports/ui/Share.jsx
 *
 * The Share component serves to preserve the aspect ratio of a
 * student's device when it is shown on the teacher's (or another
 * student's) screen. This means tracking both when the master
 * changes and when the aspect ratio of the master or the current
 * device changes.
 *
 * The Share component provides a wrapper div for the whole interface.
 * Teachers will, by design, join each group as a slave so that their
 * students can use their entire screen estate.
 *
 * In one-on-one sessions, the student will always be master. In
 * group lessons, only one student will be master. There will always
 * be a master in every group. In a many-student group, a master will
 * be chosen from those logged on when the teacher starts the group.
 * If that student leaves, mastery will be transferred to another
 * student, or the group will be dissolved. In addition, if a student
 * changes groups their status as master may change.
 *
 * This script is designed to share the view dimensions of the
 * device which is master. This may happen in three ways:
 *
 * 1. When the master first arrives
 * 2. If the master changes (this user may stop being master)
 * 3. If the current master alters the size of their browser window
 *    or flips orientation on their phone or tablet.
 *
 * <Share /> is re-rendered if
 * • The window is resized, which changes App.state.aspectRatio and
 *   tells App to request a new render
 * • Session group_id or isMaster changes, which will be detected
 *   in the withTracker() function
 */


import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data'
import { Session } from 'meteor/session'

// view_size
import StartUp from './startup/StartUp'

import { methods } from '../api/methods/mint'
const { share } = methods

import collections from '../api/collections/publisher'
const { Group } = collections



// Called by the track function that is wrapped by withTracker
// and by Share.setViewSize() when the group_id changes or the window
// is resized.
const getViewSize = () => {
  const { width, height } = document.body.getBoundingClientRect()
  return { width, height }
}


class Share extends Component {
  constructor(props) {
    super(props)

    this.isMaster    = false
    this.aspectRatio = undefined

    this.setViewSize = this.setViewSize.bind(this)

    // When the local window is resized one of two things should
    // happen:
    // 1. If this device is master, it should tell all the slave
    //    devices to update their display
    // 2. If this device is a slave, it should resise the master's
    //    view to fit optimally in the current view area
    window.addEventListener("resize", this.setViewSize, false)

    this.setViewSize()
  }


  /**
   * Called by constructor and by window.resize any time the user
   * changes the orientation of their device, or changes the size of
   * their browser window.
   */
  setViewSize(newMaster) {
    const { isMaster, canMaster } = this.props
    this.isMaster = isMaster
    this.canMaster = canMaster

    // We need to compare master_size and (local) view_size, to
    // calculate view ratios.
    const view_size = getViewSize()

    // console.log("setViewSize isMaster:", isMaster, "newMaster:", newMaster, view_size)

    const { width, height } = view_size
    const master_size = canMaster
                      ? { ...view_size } // clone so it won't change
                      : this.props.view_size
    // this.props.view_size is set by remote master. If no remote
    // master, is set locally and is identical to view_size

    const ratioH = height / master_size.height
    const ratioW = width / master_size.width
    let h
      , w

    if (ratioH > ratioW) {
      // Show view as wide as possible but reduce height
      w = width / 100
      h = height * ratioW / ratioH / 100

    } else {
      // Show view as tall as possible but reduce width
      w = width * ratioH / ratioW / 100
      h = height / 100
    }

    this.units = {
      "--w":   w + "px"
    , "--h":   h + "px"
    , "--min": Math.min(w, h) + "px"
    , "--max": Math.max(w, h) + "px"
    }

    // This component is only re-rendered if the state of the parent
    // App is changed, in which case. the rerenders can happen many
    // times a second. Besides, we need to provide the right
    // aspectRatio

    const aspectRatio = w / h

    // Don't reset App's state.aspectRatio unnecessarily, or we get
    // an endless loop of renders

    if (this.aspectRatio !== aspectRatio || newMaster) {
      this.aspectRatio = aspectRatio

      if (isMaster) { //  && this.props.group_id // by definition
        master_size.aspectRatio = aspectRatio
        this.shareMasterView( master_size )
      }

      this.convertToLocalArea(view_size, h, w)

      this.props.setViewSize({ aspectRatio, view_size })
    }
  }


  convertToLocalArea(view_size, h, w) {
    view_size.top = (view_size.height - h * 100) / 2
    view_size.left = (view_size.width - w * 100) / 2
    view_size.width = w * 100
    view_size.height = h * 100
  }


  shareMasterView(data) {
    share.call({
      _id: this.props.group_id
    , key: "view_size"
    , data
    })
  }


  render() {
    const style = Object.assign({
      position: "relative"
    , display: "flex"
    , justifyContent: "center"
    , alignItems: "center"
    , height: "calc(100 * var(--h))"
    , width: "calc(100 * var(--w))"
    }
    , this.units
    )

    return <div
      style={style}
      id="share"
    >
      {this.props.children}
    </div>
  }


  componentDidUpdate() {
    const newMaster = !this.isMaster && this.props.isMaster
                   || !this.canMaster && this.props.canMaster
    // true if this.props ~Master is true and this.~Master is false
    // false if this.~Master is true or if this.props.~Master is
    // false
    // => is only true when this.props.~Master first becomes true

    const aspectRatio    = this.props.view_size
                        && this.props.view_size.aspectRatio
    const newAspectRatio = aspectRatio
                        && this.aspectRatio !== aspectRatio

    if (newMaster || newAspectRatio) {
      this.setViewSize(newMaster)
    }
  }
}



export default withTracker(() => {
  // Get the local size by default
  let view_size = getViewSize()

  // Accessing reactive Session variables ensures that the Share
  // component is re-rendered if one of the values changes. Both
  // Session variables below start as undefined, and change when a
  // user logs in or switches groups. This mean that the code here
  // will always trigger a re-render of Share just after login.
  //
  // However, a re-render will also be triggered if the view size
  // changes. This may happen if:
  // * The screen dimensions on the remote master change
  // * The window.resize() on this device is called

  // group_id changes when user changes teacher or changes groups
  const group_id = Session.get("group_id") // may change
  let master

  if (group_id) {
    const select = { _id: group_id }
    const options = {
      fields: {
        view_size: 1
      , logged_in: 1
      }
    }

    const groupData = Group.findOne(select, options)
    const { logged_in } = (groupData || {})

    if (groupData) {
      if (groupData.view_size) {
        // Use the size defined by the group's master if it exists
        view_size = groupData.view_size
      }

      if (logged_in) {
        master = logged_in[0]
      }
    }
  }

  const isMaster  = master && ( master === Session.get("d_code") )
  const canMaster = !master || isMaster

  return {
    group_id
  , view_size
  , master
  , isMaster
  , canMaster
  }
})(Share)