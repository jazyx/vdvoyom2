import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import Native      from './Native.jsx'
import Name        from './Name.jsx'
import Teacher     from './Teacher.jsx'
import Submit      from './Submit.jsx'
import NewPIN      from './NewPIN.jsx'
import EnterPIN    from './EnterPIN.jsx'
import Teach       from './Teach.jsx'
// import CheckPIN    from './CheckPIN.jsx'
// import SaveDetails from './SaveDetails.jsx'
// import Language from './profile/Language.jsx' // to be used later
// import Group from './profile/Group.jsx' // to be created later



export default class Profile extends Component {
  constructor(props) {
    super(props)

    this.views = {
      Native
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

    return <View
      aspectRatio={this.props.aspectRatio}
      setPage={this.props.setPage}
      points={this.props.points}
    />
  }
}
