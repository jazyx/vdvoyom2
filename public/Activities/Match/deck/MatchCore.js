/**
 * /public/activities/Match/deck/MatchCore.jsx
 *
 *
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { valuesDontMatch
       , shuffle
       , getElementIndex
       , removeFrom
       } from '/imports/tools/generic/utilities'

import { StyledContainer
       , StyledFrame
       , StyledButton
       , StyledList
       , StyledThumbnail
       , StyledControls
       , StyledLock
       , StyledParticipants
       , StyledScoreData
       } from './styles'

import { forceSelect
       , userMatch
       } from '../methods'



/// DEBUGGING // DEBUGGING // DEBUGGING // DEBUGGING // DEBUGGING ///
import { logRenderTriggers } from '/imports/tools/generic/debug.js'


const hoverDelay = 2000 //ms before button switches to toggled display


export default class Match extends Component {
  constructor(props) {
    super(props)

    this.named = props.items.named
    this.anon = [...props.items.anon]
    shuffle(this.anon)

    this.state = {
      anon: 0
    , named: 0
    , timeOut: 0
    , "anon-locked": false
    , "named-locked": false
    }

    this.selectImage = this.selectImage.bind(this)
    this.toggleMatch = this.toggleMatch.bind(this)
    this.toggleReset = this.toggleReset.bind(this)
    this.toggleFullScreen = this.toggleFullScreen.bind(this)
    this.toggleLock = this.toggleLock.bind(this)
  }


  selectImage(event) {
    const index = getElementIndex(event.target)
    const type = this.getType(event.currentTarget) // named | anon

    const array = (type === "anon")
                ? this.anon
                : this.named
    const src = array[index].src
    // const target = event.target
    // const img = target.tagName === "IMG"
    //           ? target
    //           : target.parentNode.getElementsByTagName("IMG")[0]
    // const src = img.src

    this.setState({ [type]: index })

    if (this.state[type+"-locked"]) {
      this.forceSelect(type, true, index)

    }
  }


  toggleFullScreen(event) {
    const type = this.getType(event.currentTarget)
    const fullScreen = (this.state.fullScreen)
                     ? undefined
                     : type
    this.setState({ fullScreen })
  }


  getMatches() {
    // Check if there is a force choice of named
    let matches = this.props.data
                ? this.props.data.named
                : undefined
    if (!matches) {
      const index = this.state.named
      matches = this.named[index].matches
    }

    return matches
  }


  toggleMatch(event) { // event is not used
    const matches = this.getMatches()
    let pairedWith = this.state[matches] // string or undefined

    if (pairedWith) {
      pairedWith = undefined
    } else {
      pairedWith = this.anon[this.state.anon].matches
    }

    const timeOut = setTimeout(this.toggleReset, hoverDelay)
    // console.log("MatchCore toggleMatch timeout", timeOut)

    this.setState({ [matches]: pairedWith, timeOut })

    this.shareMatch(matches, pairedWith)
  }


  shareMatch(matches, pairedWith) {
    const group_id = this.props.group_id
    const user_id = this.props.user_id
    const options = {
      group_id
    , user_id
    , matches
    , pairedWith
    }

    userMatch.call(options)
  }


  toggleReset() {
    clearTimeout(this.state.timeOut)
    this.setState({ timeOut: 0 })
    console.log("TimeOut cleared")
  }


  /** <<< Only called by teacher
   *
   * @param      {<type>}  event   The event
   */
  toggleLock(event) {
    const type = this.getType(event.target)
    const key  = type + "-locked"
    const locked = !this.state[key]
    const index = this.state[type]

    this.forceSelect(type, locked, index)
    this.setState({ [key]: locked })
  }


  forceSelect(type, locked, index) {
    const group_id = this.props.group_id
    const options = {
      group_id
    , type
    }
    if (locked) {
      options.matches = this[type][index].matches
    }

    forceSelect.call(options)
  }


  getParticipants(type) {
    // fullname > selected pair > right/paired > recognized

    // console.log(
    //   "this.props.users"
    // , JSON.stringify(this.props.users, null, "  ")
    // )

    const index    = this.state.named
    const selected = this.named[index].matches
    const matches  = this.props.data
                   ? this.props.data.matches
                   : {}

    const participants = this.props.users.map( userData => {
      const pairs   = matches[userData._id] || {}
      const current = pairs[selected]
      const correct = current === selected

      let paired = Object.keys(pairs)
      const right = paired.reduce(( count, named ) => {
        if (named === pairs[named]) {
          count++
        }

        return count
      }, 0)

      paired = paired.length
      const recognized = "-"

      return (
        <li
          key={userData._id}
        >
          <StyledScoreData
            key="name"
            col="name"
          >
            {userData.fullname}
          </StyledScoreData>
          <StyledScoreData
            key="current"
            col="current"
            correct={correct}
          >
            {current}
          </StyledScoreData>
          <StyledScoreData
            key="score"
            col="score"
          >
            {right + "/" + paired}
          </StyledScoreData>
          <StyledScoreData
            key="recognized"
            col="recognized"
          >
            {recognized}
          </StyledScoreData>
        </li>
       )
    })

    return <StyledParticipants
      className="teacher"
    >
      {participants}
    </StyledParticipants>
  }
  /// Only called by teacher >>>


  getType(element) {
    const className = element.className
    const regex = /((named)|(anon))/
    const match = regex.exec(className)
    if (match) {
      return match[1]
    }
  }


  getThumbnails(array, top, isTeacher) {
    const removeUndefined = key => this.state[key] === undefined
    const notMatches = [
      "anon"
    , "named"
    , "timeOut"
    , "anon-locked"
    , "named-locked"
    , removeUndefined
    ]
    const keys = Object.keys(this.state)
    removeFrom(keys, notMatches, true)
    const values = keys.map(key => this.state[key])

    const className = top
                    ? "named"
                    : "anon"

    // console.log("thumbnails keys:", keys, "values:", values)
    const forced = (this.props.data || {})[className]
    //             matches | undefined

    const thumbnails = array.map((item, index) => {
      // console.log("thumbnail item", item)
      // index:   0 for anon | 1 for named
      // matches: <string folder name>
      // src:     <url>
      // text:    <folder name or custom string>

      const selected = this.state[className] === index
      const isForced = item.matches === forced

      const text = top || isTeacher
                 ? <span>{item.text}</span>
                 : ""

      const paired = top
                   ? !(keys.indexOf(item.matches) < 0)
                   : !(values.indexOf(item.matches) < 0)

      // console.log("className:", className, "matches:", item.matches, "selected:", selected, "paired:", paired)

      return <StyledThumbnail
        key={item.text}
        selected={selected}
        paired={paired}
        forced={isForced}
      >
        <img
          src={item.src}
        />
        {text}
      </StyledThumbnail>
    })

    if (isTeacher) {
      const locked = this.state[className+"-locked"]

      return <StyledControls
        className="teacher"
      >
        <StyledList
          top={top}
          className={className}
          onClick={this.selectImage}
          locked={locked}
        >
          {thumbnails}
        </StyledList>
        <StyledLock
          className={className}
          locked={locked}
          onClick={this.toggleLock}
        />
      </StyledControls>

    } else {
      return <StyledList
        top={top}
        className={className}
        onClick={this.selectImage}
        forced={!!forced}
      >
        {thumbnails}
      </StyledList>
    }
  }


  getComparison() {
    let { named, anon, fullScreen } = this.state // index

    // Overwrite with selections in props, created by teacher
    let {
      named: namedMatch
    , anon: anonMatch
    } = this.props.data || {} // matches

    if (namedMatch) {
      named = this.named.findIndex(item => item.matches === namedMatch)
    }
    if (anonMatch) {
      anon = this.anon.findIndex(item => item.matches === anonMatch)
    }

    const namedData = this.named[named] || {} //fallback if hot reload
    const paired = this.state[namedData.matches]
    const updateButton = !this.state.timeOut

    // console.log(
    //   "this.state"
    // , JSON.stringify(this.state, null, "  ")
    // , "named:", named
    // , "paired:", paired
    // , "timeOut:", this.state.timeOut
    // )

    named = namedData.src
    named = <img src={named} alt="" />

    anon = (this.anon[anon] || {}).src // fallback if hot reload
    anon = <img src={anon} alt="" />

    return <div

    >
      <StyledFrame
        className={( fullScreen === "named" )
                   ? "named fullscreen"
                   : "named"
                   }
        onClick={this.toggleFullScreen}
      >
        {named}
      </StyledFrame>
      <StyledFrame
        className={( fullScreen === "anon" )
                   ? "anon fullscreen"
                   : "anon"
                   }
        onClick={this.toggleFullScreen}
      >
        {anon}
      </StyledFrame>
      <StyledButton
        onClick={this.toggleMatch}
        onMouseLeave={this.toggleReset}
        paired={paired}
        update={updateButton}
      />
    </div>
  }


  getTeacherControls(isTeacher) {
    console.log("TODO add teacher controls:", isTeacher)
    if (!isTeacher) {
      return ""
    }

    return this.getParticipants()
  }


  render() {
    // const triggered = logRenderTriggers("Match RenderTriggers", this)
    // console.log("MATCH TRIGGERED", triggered)

    // console.log(
    //   "this.state"
    // , JSON.stringify(this.state, null, "  ")
    // )
    // console.log(
    //   "this.props"
    // , JSON.stringify(this.props, null, "  ")
    // )


    const isTeacher = this.props.isTeacher
    const top = true
    const count = this.anon.length
    const named = this.getThumbnails(this.named, top, isTeacher)
    const anon  = this.getThumbnails(this.anon, !top, isTeacher)
    const compare = this.getComparison()

    const teacher = this.getTeacherControls(this.props.isTeacher)

    return (
      <StyledContainer
        count={count}
        aspectRatio={this.props.aspectRatio}
      >
        {named}
        {compare}
        {anon}
        {teacher}
      </StyledContainer>
    )
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
