import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data'
import { Session } from 'meteor/session'

import { getLocalized
       , substitute
       , valuesDontMatch
       } from '/imports/tools/generic/utilities'

import { StyledProfile
       , StyledPrompt
       , StyledInput
       , StyledP
       , StyledButton
       , StyledNavArrow
       , StyledButtonBar
       } from '../styles'

import collections from '/imports/api/collections/publisher'
const { UIText } = collections



/// DEBUGGING // DEBUGGING // DEBUGGING // DEBUGGING // DEBUGGING ///
import { logRenderTriggers } from '/imports/tools/generic/debug.js'



class EnterPIN extends Component {
  constructor(props) {
    super(props)

    this.startUp = this.props.startUp
    const q_code = this.startUp.getAccountDetail("q_code") || ""
    this.state = { q_code }

    this.submit = this.submit.bind(this)
    this.editPIN = this.editPIN.bind(this)
    this.createAccount = this.createAccount.bind(this)
  }


  editPIN(event) {
    const q_code = event.target.value

    if (q_code.length > 4) {
      event.target.value = this.state.q_code
      return
    }

    this.setState({ q_code })
  }


  submit(event) {
    if (event.type === "keydown") {
      if (event.key !== "Enter") {
        return
      } else if (this.state.q_code.length !== 4) {
        event.preventDefault()
        return
      }
    }

    event.preventDefault()

    const profile = {
      q_code: this.state.q_code
    }
    this.updateProfile(profile)
  }


  createAccount() {
    this.updateProfile({ create_account: true })
  }


  getPrompt() {
    let prompt = this.props.uiText.enter_pin

    if (this.startUp.getAccountDetail("pin_given")) {
      // The user already entered one 4-digit PIN, but this was not
      // accepted. Show an error warning.

      prompt = <span>
        <span
          style={{ color: "#900" }}
        >
          {this.props.uiText.wrong_pin}
        </span><br />
        <span>{prompt}</span>
      </span>
    }

    return <StyledPrompt>
      {prompt}
    </StyledPrompt>
  }


  getPINInput() {
    return <StyledInput
      onChange={this.editPIN}
      onKeyDown={this.submit}
      autoFocus={true}
      value={this.state.q_code}
    />
  }


  getHint() {
    const prompt = this.props.uiText.no_pin

    return <StyledP>
      {prompt}
    </StyledP>
  }


  getCreateAccountButton() {
    const prompt = this.props.uiText.create_account

    return <StyledButton
      smaller="true"
      onMouseUp={this.createAccount}
    >
      {prompt}
    </StyledButton>
  }


  getButtonBar() {
    const options = this.state.q_code.length === 4
                  ? {"^0": this.startUp.getAccountDetail("username")}
                  : undefined
    const prompt = substitute(this.props.uiText.log_in, options)
    const disabled = this.state.q_code.length !== 4

    return <StyledButtonBar>
      <StyledNavArrow
        way="back"
        invisible={true}
      />
      <StyledButton
        disabled={disabled}
        onMouseUp={this.submit}
      >
        {prompt}
      </StyledButton>
      <StyledNavArrow
        way="forward"
        invisible={true}
      />
    </StyledButtonBar>
  }


  updateProfile(profile) {
    profile.view = "EnterPIN"

    this.startUp.updateProfile(profile)
  }


  render() {
    logRenderTriggers("EnterPIN Trigger", this)

    // console.log(
    //   "EnterPIN props"
    // , JSON.stringify(this.props, null, "  ")
    // )

    const prompt = this.getPrompt()
    const input = this.getPINInput()
    const hint = this.getHint()
    const createAccount = this.getCreateAccountButton()
    const buttonBar = this.getButtonBar()

    return <StyledProfile
      id="enter-pin"
    >
      {prompt}
      {input}
      {hint}
      {createAccount}
      {buttonBar}
    </StyledProfile>
  }


  shouldComponentUpdate(nextProps, nextState) {
    if ( valuesDontMatch(nextProps, this.props)
      || valuesDontMatch(nextState, this.state)
       ) {
      return true
    }

    return false
  }
}


// let oldText = {}


export default withTracker(() => {
  const native = Session.get("native")

  const select = {
   $or: [
      { cue: "enter_pin" }
    , { cue: "wrong_pin" }
    , { cue: "no_pin" }
    , { cue: "create_account" }
    , { cue: "log_in" }
    ]
  }
  let uiText = UIText.find(select)
                     .fetch()
                     .reduce((map, item) => {
                       const text = getLocalized(
                         item
                       , native
                       , "as_is"
                       )
                       map[item.cue] = text
                       return map
                     }, {})

  // const altered = valuesDontMatch(oldText, uiText)

  // console.log("EnterPIN ALTERED", altered)

  // if (altered) {
  //   oldText = uiText
  // } else {
  //   // Use the existing object, so that it is identical and
  //   // doesn't cause a re-render
  //   uiText = oldText
  // }

  // console.log(
  //   "uiText", uiText, `\ndb.uitext.find(
  //     ${JSON.stringify(select)}
  //   ).pretty()`
  // )

  return {
    uiText
  }
})(EnterPIN)
