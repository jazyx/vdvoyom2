/**
 * /imports/ui/login/landing/Splash.jsx
 *
 * Wrapper for the generic Throbber component and a splashscreen image
 */


import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import { Throbber } from './Throbber'



export default class Splash extends Component {
  render() {
    // TODO: Add logo to splash screen
    return <Throbber />
  }
}
