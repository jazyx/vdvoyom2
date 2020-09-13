/**
 * /imports/ui/profile/CheckPIN.jsx
 */

import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data'
import { Session } from 'meteor/session'

import { localize } from '../../tools/generic/utilities'

import { StyledProfile
       , StyledPrompt
       , StyledButton
       , StyledNavArrow
       , StyledButtonBar
       } from './styles'

import collections from '../../api/collections/publisher'
const { UIText } = collections




class CheckPIN extends Component {
  constructor(props) {
    super(props)

    this.start = this.start.bind(this)
    document.addEventListener("keydown", this.start, false)
  }


  start(event) {
    if (event && event.type === "keydown" && event.key !== "Enter") {
      return
    } else if (!this.state.selected) {
      return
    }

    this.props.setPage("Activity")
  }


  getPrompt() {
    const cue = "learn_pin"
    const code = Session.get("native")
    const prompt = localize(cue, code, this.props.uiText)

    return <StyledPrompt>
      {prompt}
    </StyledPrompt>
  }


  getPIN() {
    return <StyledPrompt>
      {Session.get("code")}
    </StyledPrompt>
  }


  getButtonBar() {
    const cue = "pin_memorized"
    const code = Session.get("native")
    const prompt = localize(cue, code, this.props.uiText)

    return <StyledButtonBar>
      <StyledNavArrow
        way="back"
        invisible={true}
      />
      <StyledButton
        disabled={false}
        onMouseUp={this.start}
      >
        {prompt}
      </StyledButton>
      <StyledNavArrow
        way="forward"
        invisible={true}
      />
    </StyledButtonBar>
  }


  render() {
    const prompt = this.getPrompt()
    const buttonBar = this.getButtonBar()

    return <StyledProfile
      id="check-pin"
    >
      {prompt}
      {buttonBar}
    </StyledProfile>
  }


  componentWillUnmount() {
    document.removeEventListener("keydown", this.start, false)
  }
}



export default withTracker(() => {
  const select = {
   $or: [
      { cue: "learn_pin" }
    , { cue: "pin_memorized" }
    ]
  }
  const uiText = UIText.find(select).fetch()

  return {
    uiText
  }
})(CheckPIN)
