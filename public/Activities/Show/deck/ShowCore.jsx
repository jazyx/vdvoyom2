/**
 * /public/activities/Show/deck/ShowCore.jsx
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';
import styled, { css } from 'styled-components'

import { IMAGE_REGEX
       , LINK_REGEX
       } from '/imports/tools/custom/constants'

import { setPageData
       , setSoloPilot
       } from '/imports/api/methods/admin.js'

import { Menu } from './components/menu'
import { Video } from './components/video'
import { Quote } from './components/quote'
import { StyledContainer
       , StyledNotes
       , StyledVideo
       , StyledSplash
       , StyledSolo
       , StyledDuo
       , StyledHTML
       } from './styles'



export default class Show extends Component {
  constructor(props) {
    super(props)

    this.setIndex = this.setIndex.bind(this)
    this.treatArrowKeys = this.treatArrowKeys.bind(this)
    this.getTextOrLink = this.getTextOrLink.bind(this)

    const listener = this.treatArrowKeys
    document.body.addEventListener("keydown", listener, true)
    
    this.togglePilot()

    if (props.isMaster) {
      this.setIndex(0, false)
    }
  }


  togglePilot(off) {
    if (off || this.props.isTeacher || !this.props.active) {
      const _id = this.props.group_id
      const soloPilot = off
                      ? undefined
                      : this.props.d_code

      setSoloPilot.call({
        _id
      , soloPilot
      })
    }
  }

 
  treatArrowKeys(event) {
    const items = this.props.items
    if (!items) {
      return
    }
 
    const max = items.length - 1
    let index = this.index

    switch (event.keyCode) {
      default:
        return
      case 37:
      case 38:
        index = Math.max( 0, index - 1 )
      break
      case 39:
      case 40:
        index = Math.min( index + 1, max)
    }

    this.setIndex(index)
  }


  getTextOrLink(string, key) {
    const match = LINK_REGEX.exec(string)
    if (match[2]) {
      return <p
        key={key}
      >
        {match[1]}
        <a href={match[3]} target="newtab">{match[2]}</a>
        {match[4]}
      </p>

    }  else {
      return <p
        key={key}
      >
        {string}
      </p>
    }
  }


  getSplash(item) {
    // image: {splash: "/Assets/Show/OatsAndBeans/image/splash.jpg"}
    // layout: "splash"
    // name: "splash"
    // text: "25 September 2020↵James Newton at↵[English Language Evenings III Moscow](http://elemoscow.net/location.html)"
    // _id: "4pT9midTF7Dvjo5rY"

    const text = item.text.split("\n").map(( line, index ) => {
      return this.getTextOrLink(line, index)
    })
    
    return <StyledSplash
      className="splash"
      key="splash"
    >
      <img
        src={item.image.splash}
      />
      <div>
        {text}
      </div>
    </StyledSplash>
  }


  getSolo(item) {
    // console.log(item)
    // image: {
    //   <id>: <url>
    // }
    // layout: "solo"
    // legend: [
    //   { id:     <string>
    //   , legend: <string>
    //   }
    // ]
    // menu: <string>
    // name: <string>
    // tweak: {
    //   background-color: "#fff"
    // , color: "#000"
    // }
    // _id: "dGRe2HrQ5TbYfasDe"
    // 
    // The image should be placed to fit the available space, minus
    // the space required for the legend, if there is one. There will
    // only be one image (and legend).


    const legend = item.legend
                 ? this.getTextOrLink(item.legend[0].legend)
                 : ""

    let image = item.image
    if (typeof image !== "object") {
      image = ""

    } else {
      const id = Object.keys(image)[0]
      const src = image[id]
      image = <img
        src={src}
        alt={legend || item.menu}
      />
    }

    return <StyledSolo
      className="solo"
      legend={!!legend}
    >
      {image}
      {legend}
    </StyledSolo>
  }


  getDuo(item) {
    const images = item.images.map( imageData => {
      const src = imageData.src
      const alt = IMAGE_REGEX.exec(src)[1]
      return <img
        key={alt}
        alt={alt}
        src={src}
      />
    })

    return <StyledDuo
      limit={item.limit || 1}
      aspectRatio={this.props.aspectRatio}
    >
      {images}
    </StyledDuo>
  }


  getVideo(item) {
    return <Video
      {...item}
      rect={this.props.rect}
      paused={this.props.data.paused}
      rewound={this.props.data.rewound}
      isPilot={this.props.isPilot}
      group_id={this.props.group_id}
      aspectRatio={this.props.aspectRatio}
    />
  }


  getQuote(item) {
    return <Quote
      {...item}
      aspectRatio={this.props.aspectRatio}
    />
  }


  getHTML(item) {
    // console.log("getHTML", console.log(JSON.stringify(item, null, "  ")))
    return <div
      dangerouslySetInnerHTML={{__html: item.html}}
    />
  }


  setIndex(index, menu_open) {
    const group_id  = this.props.group_id
    const data = {
      index
    }

    if (menu_open !== undefined) {
      data.menu_open = menu_open
    }

    setPageData.call({
      group_id
    , data
    })
  }


  getSlide(item) {
    switch (item.layout) {
      case "splash":
        return this.getSplash(item)
      case "solo":
        return this.getSolo(item)
      case "duo":
        return this.getDuo(item)
      case "video":
        return this.getVideo(item)
      case "quote":
        return this.getQuote(item)
      case "html":
        return this.getHTML(item)
    }
  }


  getNotes(noteArray) {
    if (!Array.isArray(noteArray) || !this.props.isPilot) {
      return ""
    }
    noteArray = noteArray.map(( note, index ) => (
      <li
        key={index}
      >
        {note}
      </li>
    ))

    return <StyledNotes>
      {noteArray}
    </StyledNotes>
  }


  getMenu(items) {
    // const { soloPilot, d_code } = this.props

    // if (soloPilot && soloPilot !== d_code) {
    //   return ""
    // }
    const open = this.props.data
               ? this.props.data.menu_open
               : false

    return <Menu
      key="menu"
      open={open}
      items={items}
      index={this.index}
      setIndex={this.setIndex}
      group_id={this.props.group_id}
      aspectRatio={this.props.aspectRatio}
    />
  }


  render() {
    // console.log("Show", JSON.stringify(this.props, null, "  "))
    const items = this.props.items

    if (!items) {
      return "Slide Show goes here"
    }

    this.index = this.props.data
                ? this.props.data.index || 0
                : 0
    const item = items[this.index]
    const tweak = item ? item.tweak : undefined

    const slide = this.getSlide(item)
    const notes = this.getNotes(item.notes)
    const menu = this.getMenu(items)

    return <StyledContainer
      className="show"
      tweak={tweak}
    >
      {slide}
      {notes}
      {menu}
    </StyledContainer>
  }


  componentWillUnmount() {
    const listener = this.treatArrowKeys
    document.body.removeEventListener("keydown", listener, true)

    if (this.props.soloPilot === this.props.d_code) {
      this.togglePilot("off")
    }
  }
}
