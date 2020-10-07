/**
 * /public/activities/Match/deck/MatchCore.jsx
 *
 *
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { valuesDontMatch
       , shuffle
       } from '/imports/tools/generic/utilities'

import { StyledContainer
       , StyledFrame
       , StyledButton
       , StyledList
       , StyledThumbnail
       } from './styles'



/// DEBUGGING // DEBUGGING // DEBUGGING // DEBUGGING // DEBUGGING ///
import { logRenderTriggers } from '/imports/tools/generic/debug.js'



export default class Match extends Component {
  constructor(props) {
    super(props)
    this.anon = [...props.items.anon]
    shuffle(this.anon)

    this.state = {}
    this.fullScreen = React.createRef()

    this.selectImage = this.selectImage.bind(this)
    this.toggleFullScreen = this.toggleFullScreen.bind(this)
  }


  selectImage(event) {
    const type = this.getType(event.currentTarget) // named | anon
    const target = event.target
    const img = target.tagName === "IMG"
              ? target
              : target.parentNode.getElementsByTagName("IMG")[0]
    const src = img.src

    this.setState({ [type]: src })
  }


  toggleFullScreen(event) {
    const type = this.getType(event.currentTarget)
    const fullScreen = (this.state.fullScreen)
                     ? undefined
                     : type
    this.setState({ fullScreen })
  }


  getType(element) {
    const className = element.className
    const regex = /((named)|(anon))/
    const match = regex.exec(className)
    if (match) {
      return match[1]
    }
  }


  getThumbnails(array, top, aspectRatio) {
    const className = top
                    ? "named"
                    : "anon"

    const thumbnails = array.map( item => {
      const text = item.index
                 ? <span>{item.text}</span>
                 : ""
      return <StyledThumbnail
        key={item.text}
      >
        <img
          src={item.src}
        />
        {text}
      </StyledThumbnail>
    })

    return <StyledList
      aspectRatio={aspectRatio}
      top={top}
      className={className}
      onClick={this.selectImage}
    >
      {thumbnails}
    </StyledList>
  }


  getComparison() {
    let { named, anon, fullScreen } = this.state

    if (named) {
      named = <img src={named} alt="" />
    }

    if (anon) {
      anon = <img src={anon} alt="" />
    }
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
      <StyledButton />
    </div>
  }


  render() {
    // const triggered = logRenderTriggers("Match RenderTriggers", this)
    // console.log("MATCH TRIGGERED", triggered)

    let { named } = this.props.items

    // console.log(
    //   "named"
    // , JSON.stringify(named, null, "  ")
    // )

    // console.log(
    //   "anon"
    // , JSON.stringify(anon, null, "  ")
    // )

    const top = true
    const count = named.length
    named = this.getThumbnails(named, top)
    const anon  = this.getThumbnails(this.anon, !top)
    const compare = this.getComparison()

    return (
      <StyledContainer
        count={count}
        aspectRatio={this.props.aspectRatio}
      >
        {named}
        {compare}
        {anon}
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
