import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import { Throbber } from './Throbber'
import StartUp from './StartUp'


// TODO: Add logo to splash screen


export default class Splash extends Component {
  constructor(props) {
    super(props)

    new StartUp(this.props.hideSplash)
  }


  render() {
    return <Throbber />
  }
}
