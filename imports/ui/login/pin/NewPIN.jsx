/**
 * /imports/ui/profile/NewPIN.jsx
 */

import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data'
import { Session } from 'meteor/session'

import { getLocalized } from '/imports/tools/generic/utilities'

import { StyledProfile
       , StyledPrompt
       , StyledPIN
       , StyledP
       , StyledButton
       , StyledNavArrow
       , StyledButtonBar
       } from '../styles'

import collections from '/imports/api/collections/publisher'
const { UIText } = collections




class NewPIN extends Component {
  constructor(props) {
    super(props)

    this.updateProfile = this.updateProfile.bind(this)
    document.addEventListener("keydown", this.updateProfile, false)
  }


  getPrompt() {
    const prompt = this.props.uiText.remember_pin
    const PIN = this.props.startUp.getAccountDetail("q_code")
    const reason = this.props.uiText.pin_reason

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
    const prompt = this.props.uiText.pin_memorized

    return <StyledButtonBar>
      <StyledNavArrow
        way="back"
        invisible={true}
      />
      <StyledButton
        disabled={false}
        onMouseUp={this.updateProfile}
      >
        {prompt}
      </StyledButton>
      <StyledNavArrow
        way="forward"
        invisible={true}
      />
    </StyledButtonBar>
  }


  updateProfile(event) {
    if (event && event.type === "keydown" && event.key !== "Enter") {
      return
    }

    this.props.startUp.updateProfile({ view: "NewPIN" })
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
  const native = Session.get("native")

  const select = {
   $or: [
      { cue: "remember_pin" }
    , { cue: "pin_reason" }
    , { cue: "pin_memorized" }
    ]
  }
  const uiText = UIText.find(select)
                       .fetch()
                       .reduce((map, item) => {
                         const text = getLocalized(
                           item
                         , native
                         )
                         map[item.cue] = text
                         return map
                       }, {})

  return {
    uiText
  }
})(NewPIN)
