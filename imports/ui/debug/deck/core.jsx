/**
 * /imports/ui/debug/deck/core.jsx
 *
 *
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import styled from 'styled-components'




export const StyledOL = styled.ol`
  position: fixed;
  top: 0;
  left: 0;
  height: 82.5vh;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  background-color: rgba(0,0,0,0.2);

  & li {
    display: flex;
    width: 300px;
    justify-content: space-between;
    text-align: right;
    text-shadow: 1px 1px 2px #000, -1px -1px 2px #000;
  }

  & li.strong {
    color: #900;
    font-weight: bold;
    text-shadow: none;
  }

  & li span {
    flex-shrink: 0;
    display: inline-block;
  }

  & li span:nth-child(1) {
    width: 40px;
  }

  & li span:nth-child(3) {
    width: 135px;
  }

  & li span:nth-child(4) {
    flex-grow: 1;
    flex-shrink: 1;
    padding: 0 0.5em;
    text-align: left;
    overflow: hidden;
  }
`



export default class Debug extends Component {
  constructor(props) {
    super(props)

    // console.log("Debug", JSON.stringify(props, null, "  "))
  }


  getView() {
    const now = + new Date()
    const listItems = this.props.fluency.map((item, index) => (
      <li
        key={item.text}
        className={(now - item.last) < 9999 ? "strong" : "green" }
      >
        <span>{index + 1}. </span>
        <span>{item.flops}</span>
        <span>{item.next}</span>
        <span>{item.text}</span>
      </li>
    ))

    const View = <StyledOL>
      {listItems}
    </StyledOL>

    return View
  }


  render() {
    const View = this.getView()

    return View
  }
}
