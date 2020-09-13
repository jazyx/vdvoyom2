/**
 * /imports/ui/login/Profile.jsx
 * 
 * The Profile component acts as a wrapper for a number of other 
 * components which may need to be shown during the login process,
 * when details need to be entered manually
 */


import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import StartUp     from './launch/StartUp'

import Splash      from './landing/Splash.jsx'
import TimeOut     from './landing/TimeOut.jsx'

import Native      from './profile/Native.jsx'
import Name        from './profile/Name.jsx'
import Teacher     from './profile/Teacher.jsx'
import Teach       from './profile/Teach.jsx'

import NewPIN      from './pin/NewPIN.jsx'
import EnterPIN    from './pin/EnterPIN.jsx'

import Submit      from './launch/Submit.jsx'

// import CheckPIN    from './CheckPIN.jsx'
// import SaveDetails from './SaveDetails.jsx'
// import Language from './profile/Language.jsx' // to be used later
// import Group from './profile/Group.jsx' // to be created later



export default class Profile extends Component {
  constructor(props) {
    super(props)

    this.startup = new StartUp(this.props.hideSplash)

    this.views = {
      Splash
    , TimeOut

    , Native
    , Name
    , Teacher
    , Submit
    , Teach

    , NewPIN
    , EnterPIN

    // , CheckPIN
    // , SaveDetails
    // , Language // for teacherless learning with a community
    // , Group    // for users who belong to multiple groups
    }
  }


  render() {
    // console.log("Profile.props:", this.props)
    const View = this.views[this.props.view]

    // console.log(View)

    return <View
      aspectRatio={this.props.aspectRatio}
      setPage={this.props.setPage}
      points={this.props.points}
    />
  }
}
