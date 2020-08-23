/**
 * /public/activities/Show/deck/ShowCore.jsx
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';
import styled, { css } from 'styled-components'

import { LINK_REGEX } from '/imports/tools/custom/constants'

import { setPageData
       , setSoloPilot
       } from '/imports/api/methods/admin.js'
import { setStart } from '../methods'


import { Menu } from './menu'
import { StyledContainer
       , StyledSplash
       , StyledSolo
       } from './styles'



export default class Show extends Component {
  constructor(props) {
    super(props)

    this.setIndex = this.setIndex.bind(this)
    this.treatArrowKeys = this.treatArrowKeys.bind(this)

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


  getSplash(item) {
    // image: {splash: "/Assets/Show/OatsAndBeans/image/splash.jpg"}
    // layout: "splash"
    // name: "splash"
    // text: "25 September 2020↵James Newton at↵[English Language Evenings III Moscow](http://elemoscow.net/location.html)"
    // _id: "4pT9midTF7Dvjo5rY"

    const text = item.text.split("\n").map(( line ,index ) => {
      const match = LINK_REGEX.exec(line)
      if (match[2]) {
        return <p
          key={index}
        >
          {match[1]}
          <a href={match[3]}>{match[2]}</a>
          {match[4]}
        </p>

      }  else {
        return <p
          key={index}
        >
          {line}
        </p>
      }
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

    const id = Object.keys(item.image)[0]
    const src = item.image[id]
    const image = <img
      src={src}
    />

    const legend = item.legend
                 ? <p>{item.legend[0].legend}</p>
                 : ""

    return <StyledSolo
      className="solo"
      legend={!!legend}
    >
      {image}
      {legend}
    </StyledSolo>
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
    }
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
    console.log("Show", JSON.stringify(this.props, null, "  "))
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
    const menu = this.getMenu(items)

    return <StyledContainer
      className="show"
      tweak={tweak}
    >
      {slide}
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
