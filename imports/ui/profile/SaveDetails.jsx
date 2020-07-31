/**
 * /imports/ui/profile/SaveDetails.jsx
 */

import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data'
import { Session } from 'meteor/session'

import { localize } from '../../tools/generic/utilities'

import { Checked, Unchecked } from '../img/svg'
import { Checkbox } from '../widgets/Checkbox'

import { StyledProfile
       , StyledPrompt
       , StyledCheckbox
       , StyledRadioButtonGroup
       , StyledRadioButton
       , StyledButton
       , StyledNavArrow
       , StyledButtonBar
       } from './styles'

import collections from '../../api/collections/publisher'
const { UIText } = collections




class SaveDetails extends Component {
  constructor(props) {
    super(props)

    const autoChecked = Session.get("auto") || true
    const startFrom   = Session.get("startFrom") || "dashboard"
    const dashChecked = startFrom === "dashboard"
    this.state = { autoChecked, dashChecked }

    this.start = this.start.bind(this)

    this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
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


  handleCheckboxChange() {

  }


  getPrompt() {
    const cue = "preferences"
    const code = Session.get("native")
    const prompt = localize(cue, code, this.props.uiText)

    return <StyledPrompt>
      {prompt}
    </StyledPrompt>
  }


  getPreferencePane() {
    const code      = Session.get("native")
    const auto      = localize("auto_login", code, this.props.uiText)
    const resume    = localize("resume", code, this.props.uiText)
    const dashboard = localize("dashboard", code, this.props.uiText)

    return <Checkbox
      className="checker"
      checked={this.state.checked}
      handleCheckboxChange={this.handleCheckboxChange}
    />
    // return <div>
    //   <Checked
    //     style={{
    //       width: "10vmin"
    //     , height: "10vmin"
    //     , fill: "#fff"
    //     , stroke: "#090"
    //     }}
    //   />
    //   <Unchecked />
    //   <StyledCheckbox
    //     checked={this.state.autoChecked}
    //   >
    //    {auto}
    //   </StyledCheckbox>
    //   <StyledRadioButtonGroup>
    //     <StyledRadioButton
    //       name="start"
    //       disabled={this.state.autoChecked}
    //       checked={this.state.dashChecked}
    //     >
    //      {resume}
    //     </StyledRadioButton>
    //     <StyledRadioButton
    //       name="start"
    //       disabled={this.state.autoChecked}
    //       checked={!this.state.dashChecked}
    //     >
    //      {dashboard}
    //     </StyledRadioButton>
    //   </StyledRadioButtonGroup>
    // </div>
  }


  getButtonBar() {
    const cue = "start"
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
    const preferencePane = this.getPreferencePane()
    const buttonBar = this.getButtonBar()

    return <StyledProfile
      id="check-pin"
    >
      {prompt}
      {preferencePane}
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
      { cue: "preferences" }
    , { cue: "auto_login" }
    , { cue: "resume" }
    , { cue: "dashboard" }
    , { cue: "start" }
    ]
  }
  const uiText = UIText.find(select).fetch()

  return {
    uiText
  }
})(SaveDetails)

