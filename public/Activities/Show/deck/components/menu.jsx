/**
 * /public/Activities/Show/deck/components/menu.jsx
 *
 *
 */


import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import { StyledMenuContainer
       , StyledShowMenu
       , StyledShowList
       , StyledShowItem
       , StyledSVG
       } from '../styles'

import { setPageData } from '/imports/api/methods/admin.js'



const Items = (props) => {
  // console.log("ShowItems", props)

  // closeMenu: <function>
  // slideIndex: undefined
  // items: [
  //   { _id:    <string>
  //   , name:   <string>
  //   , image:  { <name>: <url> }
  //   , layout: < "splash" | "solo" | ... >
  //
  //   , text:   <string>
  //   , menu:   <string>
  //   , legend: { <name>: <string>, ... }
  //   }
  // , ...
  // ]
  // open: false
  // pane: {current: ul.sc-fzoXWK.hVNnOV}
  // setPage: undefined
  // uiText: undefined

  let skip = -1
  const items = props.items.map(( item, index ) => {
    const chooseSlide = props.chooseSlide
                      ? () => props.chooseSlide( index )
                      : null

    if (item.menu) {
      return <StyledShowItem
        key={item._id}
        onMouseUp={chooseSlide}
        active={index === props.slideIndex}
      >
        <span className="index">{index - skip}.</span>
        <span className="section">{item.menu}</span>
      </StyledShowItem>

    } else {
      skip += 1
      return 0
    }
  }).filter( item => !!item )

//
  return <StyledShowList
    ref={props.pane}
    open={props.open}
  >
    {items}
  </StyledShowList>
}


const Icon = () => (
  <g className="menu">
    <path d="
      M5,20
      L5,80
      H95
      L95,20
      z" opacity="0" />
    <path d="
      M15,10
      H85
      a 10 10 180 0 1 0 20
      H15
      a 10 10 180 0 1 0 -20
      z" />
    <path d="
      M15,40
      H65
      a 10 10 180 0 1 0 20
      H15
      a 10 10 180 0 1 0 -20
      z" />
    <path d="
      M15,70
      H45
      a 10 10 180 0 1 0 20
      H15
      a 10 10 180 0 1 0 -20
      z" />
  </g>
)



export class Menu extends Component {
  constructor(props) {
    super(props)

    this.pane = React.createRef()

    // this.callback = props.callback // <<<<<

    this.openMenu = this.openMenu.bind(this)
    this.closeMenu = this.closeMenu.bind(this)
    this.chooseSlide = this.chooseSlide.bind(this)
    this.toggleOver = this.toggleOver.bind(this)

    this.state = { over: false }
    this.toggleMenu(false)

    // this.openMenu()
    // setTimeout(this.closeMenu, CLOSE_MENU_DELAY)
  }


  openMenu(event) {
    if (this.ignoreOpen) {
      return
    }

    if (event) {
      this.toggleMenu(true)
    }

    const listener = this.closeMenu
    document.body.addEventListener("touchstart", listener, true)
    document.body.addEventListener("mousedown", listener, true)
  }


  closeMenu(event) {
    // Check if the click was inside the slide-out menu. If not,
    // close the menu

    if (event && event.type === "touchstart") {
      // Prevent the mouseup from firing right behind
      this.timeout = setTimeout(() => this.timeout = 0, 300)
    } else if (this.timeout) {
      return
    }

    const pane = this.pane.current
    if (!event || (pane && !pane.contains(event.target))) {
      this.toggleMenu(false)

      // Prevent the menu from reopening immediately if the click to
      // close was on the Icon

      this.ignoreOpen = true
      setTimeout(() => this.ignoreOpen = false, 100)

      const listener = this.closeMenu
      document.body.removeEventListener("touchstart", listener,true)
      document.body.removeEventListener("mousedown", listener, true)
    }
  }


  toggleMenu(menu_open) {
    const group_id = this.props.group_id

    if (!group_id) {
      return
    }

    const data = { menu_open }

    setPageData.call({
      group_id
    , data
    })
  }


  toggleOver(event) {
    const over = (event.type === "mouseenter")
    this.setState({ over })
  }


  chooseSlide(slideIndex) {
    this.props.setSlideIndex(slideIndex)
    this.closeMenu()
  }


  render() {
    const {open, active, aspectRatio, slideIndex, items} = this.props
    let openMenu = null
      , toggleOver = null
      , chooseSlide = null

    if (active) {
      openMenu = this.openMenu
      toggleOver = this.toggleOver
      chooseSlide = this.chooseSlide
    }

    return <StyledMenuContainer
      className="show-menu-container"
    >
      <StyledShowMenu
        className="show-menu"
        open={open}
        aspectRatio={aspectRatio}
      >
        <Items
          items={items}
          pane={this.pane}
          slideIndex={slideIndex}

          chooseSlide={chooseSlide}
        />
      </StyledShowMenu>
      <StyledSVG
        className="openShowMenu"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"

        open={open}
        over={this.state.over}

        onClick={openMenu}
        onMouseEnter={toggleOver}
        onMouseLeave={toggleOver}
      >
        <Icon />
      </StyledSVG>
    </StyledMenuContainer>
  }
}