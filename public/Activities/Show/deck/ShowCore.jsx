/**
 * /public/activities/Show/deck/ShowCore.jsx
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';
import styled, { css } from 'styled-components'


import { setStart } from '../methods'



export default class Show extends Component {
  constructor(props) {
    super(props)
  }


  getSlide() {
    return "Slide Show goes here"
  }


  render() {
    const slide = this.getSlide()
    return slide
  }
}
