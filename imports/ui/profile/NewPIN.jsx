/**
 * /imports/ui/profile/NewPIN.jsx
 */

import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data'
import { Session } from 'meteor/session'

import { localize } from '../../tools/generic/utilities'

import { StyledProfile
       , StyledPrompt
       , StyledPIN
       , StyledP
       , StyledButton
       , StyledNavArrow
       , StyledButtonBar
       } from './styles'

import collections from '../../api/collections/publisher'
const { UIText } = collections




class NewPIN extends Component {
  constructor(props) {
    super(props)

    this.goNext = this.goNext.bind(this)
    document.addEventListener("keydown", this.goNext, false)
  }


  goNext(event) {
    if (event && event.type === "keydown" && event.key !== "Enter") {
      return
    }

    // console.log("NewPIN view", Session.get("view"))
    this.props.setPage("Activity")
    // this.props.setPage("CheckPIN")
  }


  getPrompt() {
    const code = Session.get("native")

    let cue = "remember_pin"
    const prompt = localize(cue, code, this.props.uiText)
    const PIN = Session.get("q_code")
    cue = "pin_reason"
    const reason = localize(cue, code, this.props.uiText)

    return <StyledProfile>
      <StyledPrompt>
        {prompt}
      </StyledPrompt>
      <StyledPIN>
        {PIN}
      </StyledPIN>
      <StyledP>
        {reason}
      </StyledP>
    </StyledProfile>
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
        onMouseUp={this.goNext}
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
      id="new-pin"
    >
      {prompt}
      {buttonBar}
    </StyledProfile>
  }
}



export default withTracker(() => {
  const select = {
   $or: [
      { cue: "remember_pin" }
    , { cue: "pin_reason" }
    , { cue: "pin_memorized" }
    ]
  }
  const uiText = UIText.find(select).fetch()

  return {
    uiText
  }
})(NewPIN)
