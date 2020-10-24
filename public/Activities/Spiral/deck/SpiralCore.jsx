/**
 * /public/activities/Spiral/deck/SpiralCore.jsx
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';
import styled, { css } from 'styled-components'

import { Frame } from './frame'
import { StyledMain } from './styles'
import { thick
       , thin
       } from './constants'
import { setStart } from '../methods'



export default class Spiral extends Component {
  constructor(props) {
    super(props)

    this.levels = 14
    this.imagesLoaded = false

    this.setStart = this.setStart.bind(this)

    this.state = {
     righthanded: true
    , imagesLoaded: false
    }

    if (this.props.isMaster) {
      this.setStart()
    }
  }


  preloadImages() {
    const imagesLoaded = true
    setTimeout(() => this.setState({ imagesLoaded }), 0)
  }


  setStart(event, direction=1) {
    const index = Math.max(0, this.props.start)
    const total = this.props.total
    let start   = 0

    if (event) {
      let element = event.target.parentNode // IMG > DIV

      while(element = element.parentNode){
        if (element.tagName === "MAIN") {
          break
        }
        start += direction
      }

      if (!start) { // going backwards, possibly through item 0
        if (direction > 0) {
          start = (index + total - 1) % total
        } else {
          start = (index + 1) % total
        }
      } else {
        start += index % total
      }
    }

    const setStartData  = {
      group_id: Session.get("group_id")
    , start
    }

    setStart.call(setStartData)
  }


  getImages() {
    const images = []

    const source = this.props.items
    const total  = this.props.total
    const start  = this.props.start || 0
    let ii = this.levels

    for ( ii ; ii-- ; ) {
      const index = (start + ii) % total
      images.push(source[index])
    }

    return images
  }


  cycle(array) {
    const item = array.shift()
    array.push(item)
    return item
  }


  getLoc(aspect, position, lead) {
    let top
      , left

    if (aspect === "landscape") {
      switch (position) {
        case "top":
          top = "0;"
          left = "0;"
        break
        case "bottom":
          left = "0;"
          top = lead
              ? 0
              : thick +"%"
      }

    } else { // right-handed portrait
      switch (position) {
        case "right":
          top = "0;"
          left = lead
               ? 0
               : thick + "%"
        break
        case "left":
          left = "0;"
          top = "0;"
      }
    }

    return {
      top
    , left
    }
  }


  getFrames() {
    const images = this.getImages()
    const last   = images.length - 1
    let aspects
      , positions
      , places

    if ( this.landscapeMode) {
      aspects   = ["portrait", "landscape"]
      if (this.state.righthanded) {
        positions = ["right", "bottom", "left", "top"]
        places    = ["bottom", "left", "top", "right"]
      } else {
        positions = ["left", "bottom", "right", "top"]
        places    = ["bottom", "right", "top", "left"]
      }
    } else { // portrait
      aspects = ["landscape", "portrait"]
      if (this.state.righthanded) {
        positions = ["bottom", "right", "top", "left"]
        places    = ["right", "top", "left", "bottom"]

      } else {
        positions = ["bottom", "left", "top", "right"]
        places    = ["left", "top", "right", "bottom"]
      }
    }

    let frame = ""

    images.forEach((src, index) => {
       const aspect    = this.cycle(aspects)
       const position  = this.cycle(positions)
       const place     = this.cycle(places)
       const lead      = (index === last)
       const className = src.startsWith("data:image/gif;")
                       ? "no-border"
                       : ""

       const { top, left } = this.getLoc(aspect, position, lead)
       const width  = (aspect === "landscape")
                    ? "100%"
                    : ( lead )
                      ? "100%"
                      : thin + "%"
       const height = (aspect === "landscape")
                    ? ( lead )
                      ? "100%"
                      : thin + "%"
                    : "100%"
       frame = <Frame
         src={src}
         top={top}
         left={left}
         lead={lead}
         width={width}
         height={height}
         aspect={aspect}
         position={position}
         place={place}
         className={className}
       >
         {frame}
       </Frame>
    })

    return frame
  }


  getMain() {
    const frames = this.getFrames()
    const main = <StyledMain
      onMouseUp={this.setStart}
      aspectRatio={this.props.aspectRatio}
    >
      {frames}
    </StyledMain>

    return main
  }


  render() {
    this.landscapeMode = this.props.aspectRatio > 1

    const total = this.props.total
    if (total < 10) {
      return <p>Loading...</p>

    } else if (!this.state.imagesLoaded) {
      this.preloadImages()
      return <p>Loading images...</p>
    }

    const main = this.getMain()
    return main
  }
}
