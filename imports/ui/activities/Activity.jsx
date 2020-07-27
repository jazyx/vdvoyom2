/**
 * /imports/ui/activities/Activity.jsx
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import { withTracker } from 'meteor/react-meteor-data'
import activityTracker from './tracker'

import { getElementIndex } from '../../tools/generic/utilities'
import { SET_REGEX } from '../../tools/custom/constants'

import { StyledProfile
       , StyledPrompt
       , StyledChoice
       , StyledChoices
       , StyledDescription
       , StyledButton
       } from './Styles'

import { methods } from '../../api/methods/mint'
const { setPage } = methods



/* IMPORTANT NOTES - TO BE REVISED (render = 0 is currently not used)
 * ===============
 * If the user has chosen not to restore_all on start up, we need to
 * ignore the Group's .path value, but only the first time the Activity
 * component is displayed. The withTracker wrapper will automatically
 * trigger Activity.render() twice, even though there is no change to
 * state or props. On my development machine, the time interval is
 * around 40 ms.
 *
 * In order to ignore .path on the first significant display (rather
 * than the first render), we need to:
 *
 * * Check if Session.get("restore_all") is falsy, and if so:
 *   * Check that render is being called for the first or second time
 *
 * If all both of these circumstances occur, then:
 *
 * * The data in Group's .path will be ignored
 * * The list of activities read in from the Activity collection
 *   will be shown instead
 */



var render = 0 // required as described above



class ActivityClass extends Component {
  constructor(props) {
    super(props)

    this.state = { selected: -1 }
    this.goActivity = this.goActivity.bind(this)
    this.selectActivity = this.selectActivity.bind(this)
    this.scrollIntoView = this.scrollIntoView.bind(this)

    this.scrollTo = React.createRef()


    // Allow Enter to accept the default/current language
    document.addEventListener("keydown", this.goActivity, false)
    window.addEventListener("resize", this.scrollIntoView, false)
  }


  selectActivity(event) {
    const element = event.target
    const selected = getElementIndex(element, "UL")
    if (selected === this.state.selected) {
      return this.goActivity()
    }

    this.setState({ selected })
    this.scrollFlag = true // move fully onscreen if necessary
  }


  goActivity(event) {
    if (event && event.type === "keydown" && event.key !== "Enter") {
      return
    }

    const chosen = this.props.items[this.state.selected]

    if (chosen) {
      if (chosen.tag) {
        this.startActivity(chosen)

      } else { //if (choice.key) {
        this.showOptions(chosen)
      }
    }
  }


  startActivity(chosen) {
    const group_id = this.props.group_id
    const path = chosen.path
    const index = path.split(SET_REGEX).length

    const page = {
      path
    , index
    , tag: chosen.tag
    }

    setPage.call({
      group_id
    , page
    })

    // console.log("startActivity:", page)
  }


  /**
   * The user selected an item deeper down the hierarchy.
   * this.props.path may in fact go even deeper. In other words, the
   * user may have used the Menu to move back up to display the
   * parent sets. The chosen item may thus be:
   *
   * • Farther down the same path that ever before
   * • Returning to a deeper place where we've been before
   * • Stepping off on a different path
   *
   * @param  {object}  chosen  { name:   { en: "Game", ...}
   *                           , description: { en: "About...", ...}
   *                           , icon:   <url/^0.ext>
   *                           , path:   "/Game/set/../match/point"
   *                           , tag:    void || [ <string>, ... ]
   *                           }
   */
  showOptions(chosen) {
    const group_id = this.props.group_id
    const current  = this.props.path || ""
    const page     = this.getPage(current, chosen)
    page.index     = this.props.index + 1

    setPage.call({
      group_id
    , page
    })
  }


  getPage(current, chosen) {
    const page = {}

    if (current.startsWith(chosen.path)) {
      // Returning to a deeper place where we've been before
      page.path = current
      page.tag = this.props.tag

    } else {
      // Either we're going farther down the same path that ever
      // before, or we're stepping off onto a different path
      page.path = chosen.path
      page.tag = chosen.tag
    }

    return page
  }


  scrollIntoView() {
    const element = this.scrollTo.current
    if (element) {
      element.scrollIntoView({behavior: 'smooth'})
    }
  }


  getPrompt() {
    const prompt = this.props.uiText.activity

    return <StyledPrompt
      aspectRatio={this.props.aspectRatio}
    >
      {prompt}
    </StyledPrompt>
  }


  getChoices() {
    const choices = this.props.items.map((choice, index) => {
      const path     = choice.path
      const src      = choice.icon
      const name     = choice.name
      const disabled = !!choice.disabled
      const selected = this.state.selected === index
      const ref      = selected
                     ? this.scrollTo
                     : ""
      return (
        <StyledChoice
          key={path}
          src={src}
          ref={ref}
          disabled={disabled}
          selected={selected}
          onMouseUp={this.selectActivity}
          aspectRatio={this.props.aspectRatio}
        >
          <p>{name}</p>
        </StyledChoice>
      )
    })

    return <StyledChoices
      id="choice-list"
      aspectRatio={this.props.aspectRatio}
    >
      {choices}
    </StyledChoices>
  }


  getDescription() {
    let description = ""

    if (this.state.selected < 0) {

    } else {
      const choice = this.props.items[this.state.selected]
      if (choice) {
        description = choice.description
      }
    }

    return <StyledDescription
      aspectRatio={this.props.aspectRatio}
    >
      {description}
    </StyledDescription>
  }


  getButton() {
    const disabled = this.state.selected < 0
    const prompt = this.props.uiText.start

   return <StyledButton
      disabled={disabled}
      onMouseUp={this.goActivity}
      aspectRatio={this.props.aspectRatio}
    >
      {prompt}
    </StyledButton>
  }


  render() {
    // console.log(JSON.stringify(this.props.items, null, "  "))

    const prompt = this.getPrompt()
    const choices = this.getChoices()
    const description = this.getDescription()
    const button = this.getButton()

    return <StyledProfile
      id="choices"
      aspectRatio={this.props.aspectRatio}
    >
      {prompt}
      {choices}
      {description}
      {button}
    </StyledProfile>
  }


  componentDidUpdate(prevProps, prevState) {
    if (this.scrollFlag) {
      setTimeout(this.scrollIntoView, 1000) // <<< HARD-CODED
      this.scrollFlag = false
    }
  }


  componentWillUnmount() {
    window.removeEventListener("resize", this.scrollIntoView, false)
    document.removeEventListener("keydown", this.goActivity, false)
  }
}



export default withTracker(() => {
  return activityTracker.getProps()
})(ActivityClass)