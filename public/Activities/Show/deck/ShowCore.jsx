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

import Menu from './components/menu'
import Video from './components/video'
import Quote from './components/quote'
import { StyledContainer
       , StyledNotes
       , StyledVideo
       , StyledSplash
       , StyledSolo
       , StyledDuo
       , StyledHTML
       , StyledList
       } from './styles'



export default class Show extends Component {
  constructor(props) {
    super(props)

    this.setSlideIndex = this.setSlideIndex.bind(this)
    this.treatArrowKeys = this.treatArrowKeys.bind(this)
    this.getTextOrLink = this.getTextOrLink.bind(this)

    const listener = this.treatArrowKeys
    document.body.addEventListener("keydown", listener, true)

    this.togglePilot()

    if (props.isMaster && props.slideIndex === "undefined") {
      this.setSlideIndex(0, false)
    }
  }


  togglePilot(off) {
    if ( off
      || this.props.isTeacher
      || (!this.props.active && this.props.isMaster)
       ) {

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
    // console.log(
    //   "treatArrowKeys this.props"
    // , JSON.stringify(this.props, null, "  ")
    // )

    const { items, isPilot } = this.props
    if ( !items || !isPilot ) {
      return
    }

    const max = items.length - 1
    let slideIndex = this.slideIndex

    switch (event.keyCode) {
      default:
        return
      case 37:
      case 38:
        slideIndex = Math.max( 0, slideIndex - 1 )
      break
      case 39:
      case 40:
        slideIndex = Math.min( slideIndex + 1, max)
    }

    this.setSlideIndex(slideIndex)
  }


  getTextOrLink(Tag, string, key) {
    const match = LINK_REGEX.exec(string)
    if (match[2]) {
      return <Tag
        key={key}
      >
        {match[1]}
        <a href={match[3]} target="ele">{match[2]}</a>
        {match[4]}
      </Tag>

    }  else {
      return <Tag
        key={key}
      >
        {string}
      </Tag>
    }
  }


  getSplash(item) {
    // image: {splash: "/Assets/Show/OatsAndBeans/image/splash.jpg"}
    // layout: "splash"
    // name: "splash"
    // text: "25 September 2020↵James Newton at↵[English Language Evenings III Moscow](http://elemoscow.net/location.html)"
    // _id: "4pT9midTF7Dvjo5rY"

    let text = item.text.split("\n").map(( line, index ) => {
      return this.getTextOrLink("p", line, index)
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
                 ? this.getTextOrLink("p", item.legend[0].legend)
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
    // const images = item.images.map( imageData => {
    //   const src = imageData.src
    //   const alt = IMAGE_REGEX.exec(src)[1]
    //   return <img
    //     key={alt}
    //     alt={alt}
    //     src={src}
    //   />
    // })

    //return <StyledDuo
    //  limit={item.limit || 1}
    //  aspectRatio={this.props.aspectRatio}
    //>
    //  {images}
    //</StyledDuo>

    const legend = item.legend
                 ? this.getTextOrLink("p", item.legend[0].legend)
                 : ""

    let image
    if (this.props.aspectRatio < 1) {
      image = item.images.v
    } else {
      image = item.images.h
    }

    image = <img
      src={image}
      alt={legend || item.menu}
    />

    return <StyledSolo
      className="solo"
      legend={!!legend}
    >
      {image}
      {legend}
    </StyledSolo>
  }


  getVideo(item) {
    const {
      rect
    , data // { rewound: <>, paused: <> }
    , isPilot
    , group_id
    , aspectRatio
    } = this.props
    const props = {
      rect
    , isPilot
    , group_id
    , aspectRatio
    , ...data
    }

    return <Video
      {...item}
      {...props}
    />

    // cue={cue}
    // rect={rect}
    // paused={data.paused}
    // rewound={data.rewound}
    // isPilot={isPilot}
    // group_id={group_id}
    // aspectRatio={aspectRatio}
  }


  getQuote(item) {
    const textPosition = item.layout === "quote-left"
                       ? "left"
                       : "right"
    const component = <Quote
      {...item}
      textPosition={textPosition}
      aspectRatio={this.props.aspectRatio}
    />
    return component
  }


  getHTML(item) {
    // console.log("getHTML", console.log(JSON.stringify(item, null, "  ")))
    return <div
      dangerouslySetInnerHTML={{__html: item.html}}
    />
  }


  getList(item) {
    let header = item.header
    if (header) {
      header =  <h1>
        {header}
      </h1>
    }

    const items = item.items.map( item => {
      const key = item.substring(0, 16)
      item = this.getTextOrLink("li", item, key)

      return item
    })

    return <StyledList>
      {header}
      <ul>
        {items}
      </ul>
    </StyledList>
  }


  setSlideIndex(slideIndex, menu_open) {
    const group_id  = this.props.group_id
    const data = {
      slideIndex
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
      case "quote-right":
      case "quote-left":
        return this.getQuote(item)
      case "html":
        return this.getHTML(item)
      case "list":
        return this.getList(item)
    }
  }


  getNotes(noteArray) {
    // const props = {...this.props}
    // delete props.items
    // console.log("getNotes", JSON.stringify(props, null, "  "))

    const { isPilot, isTeacher } = this.props

    if ( !Array.isArray(noteArray)
      || !isPilot
      || !isTeacher
       ) {
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

    const { group_id, isPilot } = this.props
    // this.slideIndex is set in render()

    return <Menu
      key="menu"
      open={open}
      active={isPilot}
      items={items}
      group_id={group_id}

      slideIndex={this.slideIndex}

      setSlideIndex={this.setSlideIndex}
      aspectRatio={this.props.aspectRatio}
    />
  }


  render() {
    // console.log("Show", JSON.stringify(this.props, null, "  "))

    const items = this.props.items

    if (!items) {
      return "Slide Show goes here"
    }

    this.slideIndex = this.props.data
                    ? this.props.data.slideIndex || 0
                    : 0
    const item = items[this.slideIndex]
    if (!item) {
      return "Hot reload"
    }

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
