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

import { StyledHalf
       , StyledBlock
       , StyledHolder
       , StyledThumbnail
       } from './styles'



/// DEBUGGING // DEBUGGING // DEBUGGING // DEBUGGING // DEBUGGING ///
import { logRenderTriggers } from '/imports/tools/generic/debug.js'



export default class Match extends Component {
  constructor(props) {
    super(props)
    this.anon = [...props.item.anon]
    shuffle(this.anon)
  }


  getThumbnails(array, top, aspectRatio) {
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

    return <StyledBlock
      aspectRatio={aspectRatio}
      top={top}
    >
      {thumbnails}
    </StyledBlock>
  }


  render() {
    const triggered = logRenderTriggers("Match RenderTriggers", this)
    console.log("MATCH TRIGGERED", triggered)

    let { named, anon } = this.props.items
    const { aspectRatio } = this.props
    named = this.getThumbnails(named, true, aspectRatio)
    anon  = this.getThumbnails(anon, false, aspectRatio)

    return (
      <StyledHalf
        aspectRatio={this.props.aspectRatio}
      >
        {named}
        {anon}
      </StyledHalf>
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
