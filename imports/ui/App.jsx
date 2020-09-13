/**
 * /imports/ui/App.jsx
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data'

import { teacher } from '../tools/custom/teacher'
import { SET_REGEX } from '../tools/custom/constants'

import { methods } from '../api/methods/mint'
const { setPage, toggleActivation } = methods

import collections from '../api/collections/publisher'
const { Group } = collections


//// VIEWS // VIEWS // VIEWS // VIEWS // VIEWS // VIEWS // VIEWS ////
//
// Share is a div that wraps all content. On the device that is
// sharing its screen (master), the content will fill the screen. On
// other devices that are viewing and interacting with the master,
// the Share wrapper will ensure that the aspect ratio of the master
// screen is preserved. It maintains the `units` Session variable.
//   Since it is the first view to be rendered, and since the same
// instance is used for the whole lifetime of the app, it also
// opens connections to all non-activity collections, and keeps them
// open until the user quits the app.
import Share from './Share.jsx'

// // Splash is shown until all the collections are ready, or for 1 s,
// // whichever is longer. TimeOut is shown if the non-activity
// // collections take too long to load.
// import Splash from './login/landing/Splash.jsx'
// import TimeOut from './login/landing/TimeOut.jsx'

// The Menu is an overlay which users can slide out from the left to
// choose different activities, different options within an activity
// or their profile settings. The teacher (as a privileged slave) can
// interact with the menu, but other users cannot.
import Menu from './Menu.jsx'

// "<<< TODO
// The Points view sits above Menu and the other Share'd content
// to display remote cursor and touch actions
import Points from './Points.jsx'

// The Chat overlay will slide out from the right. When it is hidden
// incoming messages will be shown briefly in a semi-transparent layer
// over the Share'd content. Its layout is not restricted to the
// Share viewport, but it is displayed as a child of the Share
// component for HTML neatness.
import Chat from './Chat.jsx'

// The Debug overlay can be used to display live data during
// development. It should be removed for production.
import Debug from './debug/Debug.jsx'

// Profile is basically a switch which shows one by one a series of
// screens used by first time users, and for updating your profile.
import Profile from './login/Profile.jsx'

// Activity shows a scrolling list of available activities, or of
// options that are accessible from inside an activity
import Activity from './activities/Activity.jsx'

// Activity modules
import views from './activities/mint'



// Disable the context menu. Everywhere. (TODO - for production )
document.body.addEventListener("contextmenu", (event) => {
  // event.preventDefault()
  return false
}, false)



class App extends Component {
  constructor(props) {
    super(props)

    this.views = {
      Profile
    // Aliases for the Profile views, so that the Menu can show them
    , Splash: true
    , TimeOut: true

    , Native: true
    , Name: true
    , Teacher: true
    , Teach: true

    , Submit: true // TODO: remove when no longer needed

    , NewPIN: true
    , EnterPIN: true

    // Activities
    , Activity
    , ...views
    }

    // console.log("this.views:", this.views)

    this.state = { view: "Splash" }

    this.setPage           = this.setPage.bind(this)
    this.hideSplash        = this.hideSplash.bind(this)
    this.setViewSize       = this.setViewSize.bind(this)
    this.storePointsMethod = this.storePointsMethod.bind(this)
  }


  /** Called by Share.setViewSize
   *
   * @param {object}  sizeAndRatio   { "aspectRatio": <number>,
   *                                    "view_size": {
   *                                      "width":  <number>,
   *                                      "height": <number>,
   *                                      "top":    <number>,
   *                                      "left":   <number>
   *                                    }
   *                                  }
   */

  setViewSize(sizeAndRatio) {
    this.setState(sizeAndRatio)
  }


  hideSplash(page, group_id) {
    if (!page) {
      page = "TimeOut"
    }

    // Setting this.state.ready is redundant if page can be set,
    // since setting it will alter this.props. But it's just neater
    // to have ready set to true, regardless of the circumstances.
    this.setState({ ready: true })

    let view
    if (view = page.view) {
      // During a hot reload, Session.get("group_id") will get reset
      // to undefined, so this.props not include a `page` property.
      // Saving the view in this.state so that it can be used if
      // this.props.page is missing means that the StartUp sequence
      // will not be run a second time.
      this.setState({ view })
    }

    this.setPage(page, group_id)
  }


  /** Called by hideSplash, from Menu component and profile Views
   *  such as Name, Native and EnterPIN.
   *
   * Calls the setPage Meteor method to update the page object of the
   * current group. The page object will be available via
   * this.props.page to all members of the group.
   *
   * @param      {object}  page    string
   *                               OR object with the format:
   *                               { view: "Native"
   *                               , next: { // optional: where to g
   *                                         // when [Done] is pressed
   *                                   path: []
   *                                 , index: <integer>
   *                                 , lastItemIsTag: false
   *                                 , data: {...}
   *                                 }
   *                               }
   *                               OR
   *                               { view: "Ignored"
   *                               , path: [<string>, ...]
   *                               , index: <integer>
   *                               , lastItemIsTag: <boolean>
   *                               , data: {...}
   *                               }
   *                               Either view or path is required.
   *                               view is ignored if path is present
   *                               data is required if lastItemIsTag
   *                                 is true
   *                               index will default to 0 if missing
   *                               lastItemIsTag will default to false
   */
  setPage(page, group_id = this.props.group_id) {
    if (page && group_id) {
      if (typeof page === "string") {
        page = { view: page }
      }

      const options = {
        group_id
      , page
      }
      setPage.call(options)

    } else {
      const view = page.view || page
      this.setState({ view }) // string
    }
  }


  getView() {
    const page = this.props.page

    if (!page) {
      return this.state.view

    } else if (this.props.emptyGroup) {
      teacher.leaveGroup()
      return "Teach"
    }

    let path = page.path // "/Activity/folder//exercise"

    if (path) {
      path = path.split("/") // "" ||"/Activity/folder/.../exercise"
      // [""] || ["", "Activity", "folder", ..., "exercise"]

      const index = page.index || 0

      const tag = page.tag

      if (index === path.length - !!tag) {
        return path[1]

      } else { // not tagged item
        return "Activity"
      }

    } else { // no path
      return page.view // || "Profile"
    }
  }


  getLayers(showLayers, aspectRatio) {
    if (!showLayers) {
      return ""
    }

        // hide={this.state.view === "Profile"}
 
    return [
      <Menu
        key="menu"
        setPage={this.setPage}
        aspectRatio={aspectRatio}
      />
    , <Points
        key="points"
        ref={this.storePointsMethod}
        rect={this.state.view_size}
      />
    , <Chat
        key="chat"
      />
    ]
  }


  storePointsMethod(pointsComponent) {
    if (pointsComponent) {
      this.pointsMethod = pointsComponent.pointsMethod
      this.pointsMethod(
        { type: "test message", target: "App.storePointsMethod" }
      )
    }
  }


  render() {
    // The Share component needs to be rendered in order for
    // this.state.units to be set, so the first render will have no
    // content

    const aspectRatio = this.state.aspectRatio
    // Will be meaningless until setViewSize is called

    let view = this.getView()
    let View = this.views[view]

    let showLayers = true
    let hideSplash

    // Menu might ask to jump directly to a basic choice view. Use
    // Profile to navigate between them.
    switch (view) {
      case "Splash":
        hideSplash = this.hideSplash // fall through

      case "TimeOut":

      case "Name":
      case "Teach":
      case "Native":
      case "Teacher":

      case "Submit": // TODO: Remove when no longer needed

      case "NewPIN":
      case "EnterPIN":
        showLayers = false
        View = this.views.Profile
      break

      case "Profile":
        view = "Native"
        showLayers = false
    }

    const layers = this.getLayers(showLayers, aspectRatio)

    return <Share
      setViewSize={this.setViewSize} // <View /> will set the view
    >
      <View
        view={view}
        setPage={this.setPage}
        aspectRatio={aspectRatio}
        points={this.pointMethod}
        rect={this.state.view_size}

        hideSplash={hideSplash}
      />
      {layers}
    </Share>

    //  <Debug />
  }
}


export default withTracker(() => {
  const group_id  = Session.get("group_id")

  let emptyGroup = false
  let page

  if (group_id) {
    const isTeacher = Session.get("role") === "teacher"
    const groupSelect = { _id: group_id }
    const groupProject = {
      fields: {
        page: 1
      , logged_in: 1
      }
    }
    const groupData = Group.findOne(groupSelect, groupProject) || {}
    const logged_in = groupData.logged_in || []

    if (isTeacher && logged_in.length === 1) {
      // In a teacher-only group for navigating teacher pages, there
      // logged_in.length will be 0. So this case is only triggered
      // when all the Users have left the teacher alone in a Users
      // group.
      emptyGroup = true
    }

    page = groupData.page
  }

  const props = {
    group_id
  , emptyGroup
  , page
  }

  // console.log("App props:", props)

  return props
})(App)