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




class Language extends Component {
  constructor(props) {
    super(props)

    this.state = { ready: false }
  }


  getPrompt() {
    const cue = "which_language"
    const code = Session.get("native")
    const prompt = localize(cue, code, this.props.uiText)

    return <StyledPrompt>
      {prompt}
    </StyledPrompt>
  }


  //// PROVIDE A LIST OF LANGUAGES ////


  getButtonBar() {
    const cue = "next"
    const code = Session.get("native")
    const prompt = localize(cue, code, this.props.uiText)
    const disabled = !Session.get("teacher")

    return <StyledButtonBar>
      <StyledNavArrow
        way="back"
        disabled={false}
        onMouseUp={() => this.props.setPage("Name")}
      />
      <StyledButton
        disabled={!this.state.ready}
        onMouseUp={this.setTeacher}
      >
        {prompt}
      </StyledButton>
      <StyledNavArrow
        way="forward"
        disabled={disabled}
        onMouseUp={() => this.props.setPage("Teacher")}
      />
    </StyledButtonBar>
  }


  render() {
    const prompt = this.getPrompt()
    const buttonBar = this.getButtonBar()

    return <StyledProfile
      id="language"
    >
      {prompt}
      {buttonBar}
    </StyledProfile>
  }
}



export default withTracker(() => {
  const select = {
    $or: [
      { cue: "which_language" }
    , { cue: "next" }
    ]
  }
  const uiText = UIText.find(select).fetch()

  return {
    uiText
  }
})(Language)
