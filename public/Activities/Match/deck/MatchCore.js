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
       } from './styles'



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
  }


  toggleFullScreen(event) {
    const type = this.getType(event.currentTarget)
    const fullScreen = (this.state.fullScreen)
                     ? undefined
                     : type
    this.setState({ fullScreen })
  }


  toggleMatch(event) {
    const named = this.state.named // index
    const matches = this.named[named].matches // string
    let pairedWith = this.state[matches] // string or undefined

    if (pairedWith) {
      pairedWith = undefined
    } else {
      pairedWith = this.anon[this.state.anon].matches
    }

    const timeOut = setTimeout(this.toggleReset, hoverDelay)
    // console.log("MatchCore toggleMatch timeout", timeOut)

    this.setState({ [matches]: pairedWith, timeOut })
  }


  toggleReset() {
    clearTimeout(this.state.timeOut)
    this.setState({ timeOut: 0 })
    console.log("TimeOut cleared")
  }


  toggleLock(event) {
    const type = this.getType(event.target) + "-locked"
    const locked = !this.state[type]
    this.setState({ [type]: locked })
  }


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

    const thumbnails = array.map((item, index) => {
      // console.log("thumbnail item", item)
      // index:   0 for anon | 1 for named
      // matches: <string folder name>
      // src:     <url>
      // text:    <folder name or custom string>

      const selected = this.state[className] === index

      const text = top
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
      >
        {thumbnails}
      </StyledList>
    }
  }


  getComparison() {
    let { named, anon, fullScreen } = this.state

    const namedData = this.named[named]
    const paired = this.state[namedData.matches]
    const updateButton = !this.state.timeOut

    // console.log(
    //   "this.state"
    // , JSON.stringify(this.state, null, "  ")
    // , "named:", named
    // , "paired:", paired
    // , "timeOut:", this.state.timeOut
    // )

    named = this.named[named].src
    named = <img src={named} alt="" />

    anon = this.anon[anon].src
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
    console.log("isTeacher:", isTeacher)
    if (!isTeacher) {
      return ""
    }
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
