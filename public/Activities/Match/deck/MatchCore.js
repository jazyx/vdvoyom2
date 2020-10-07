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

    return <StyledList
      aspectRatio={aspectRatio}
      top={top}
    >
      {thumbnails}
    </StyledList>
  }


  getComparison() {
    return <div
   
    >
      <StyledFrame />
      <StyledFrame />
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
