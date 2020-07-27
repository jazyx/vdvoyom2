import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data'
import { Session } from 'meteor/session'
import { localize } from '../../tools/generic/utilities'

import { StyledProfile
       , StyledPrompt
       , StyledInput
       , StyledButton
       , StyledNavArrow
       , StyledButtonBar
       } from './styles'

import collections from '../../api/collections/publisher'
const { UIText } = collections


class Name extends Component {
  constructor(props) {
    super(props)

    const username = Session.get("username") || ""
    this.state = { username }

    this.input = React.createRef()
    this.editUserName = this.editUserName.bind(this)
    this.setUserName = this.setUserName.bind(this)
  }


  editUserName(event) {
    const username = this.input.current.value
    this.setState({ username })
  }


  setUserName(event) {
    if (!this.state.username) {
      return
    }

    if (event.type === "keydown") {
      if (event.keyCode !== 13) {
        return
      }
    }

    event.preventDefault()
    Session.set("username", this.state.username)

    this.props.setPage("Teacher")
  }


  getPhrase(cue) {
    const code = Session.get("native")
    return localize(cue, code, this.props.uiText)
  }


  getPrompt() {
    const prompt = this.getPhrase("enter_name")

    return <StyledPrompt>
      {prompt}
    </StyledPrompt>
  }


  getInput() {
    const placeholder = this.getPhrase("username")

    return <StyledInput
      type="text"
      ref={this.input}
      value={this.state.username}
      placeholder={placeholder}
      onChange={this.editUserName}
      onKeyDown={this.setUserName}
      autoFocus={true}
    />
  }


  getButtonBar() {
    const prompt = this.getPhrase("next")
    const disabled = !Session.get("teacher")

    return <StyledButtonBar>
      <StyledNavArrow
        way="back"
        disabled={false}
        onMouseUp={() => this.props.setPage("Native")}
      />
      <StyledButton
        disabled={!this.state.username}
        onMouseUp={this.setUserName}
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
    const input  = this.getInput()
    const buttonBar = this.getButtonBar()

    return <StyledProfile
      id="user-name"
      onMouseUp={this.props.points}
      onMouseDown={this.props.points}
      onTouchStart={this.props.points}
      onTouchEnd={this.props.points}
    >
      {prompt}
      {input}
      {buttonBar}
    </StyledProfile>
  }
}



export default withTracker(() => {
  const key    = "phrase"
  const select = {
    $and: [
      { type: { $eq: key }}
    , { file: { $exists: false }}
    ]
  }
  const uiText = UIText.find(select).fetch()

  return {
    uiText
  }
})(Name)
