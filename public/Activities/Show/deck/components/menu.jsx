/**
 * /public/Activities/Show/deck/components/menu.jsx
 *
 *
 */


import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import { StyledMenuContainer
       , StyledNavBar
       , StyledNavButton
       , StyledShowMenu
       , StyledShowList
       , StyledShowItem
       , StyledSVG
       } from '../styles'

import { setPageData } from '/imports/api/methods/admin.js'



class Items extends Component{
  constructor(props) {
    super(props)
    this.selected = React.createRef()
  }


  render() {
    // console.log(
    //   "Show Items props"
    // , this.props
    // )

    // chooseSlide: <function>
    // items:       <array of objects>
    // pane:        <ref object>
    // slideIndex:  <string integer>

    let { chooseSlide, items, pane, slideIndex } = this.props
    let skip = -1

    items = items.map(( item, index ) => {
      const onMouseUp = chooseSlide
                      ? () => chooseSlide( index )
                      : null
      const active = index === slideIndex
      const ref = active ? this.selected : undefined

      // console.log("Menu item.key:", item.key)

      if (item.menu) {
        return <StyledShowItem
          key={item.key}
          onMouseUp={onMouseUp}
          active={active}
          ref={ref}
        >
          <span className="index">{index - skip}.</span>
          <span className="section">{item.menu}</span>
        </StyledShowItem>

      } else {
        skip += 1
        return 0
      }
    }).filter( item => !!item )

    return <StyledShowList
      ref={pane}
    >
      {items}
    </StyledShowList>
  }


  componentDidUpdate() {
    const selected = this.selected.current
    // console.log("Item selected:", selected)
    if (selected) {
      if (selected.scrollIntoViewIfNeeded) {
        selected.scrollIntoViewIfNeeded()
      } else {
        selected.scrollIntoView()
      }
    }
  }
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


const Arrow = ({direction}) => (
  <g
   className="menu"
   transform={ direction === "back"
               ? "scale(-1, 1) translate(-100, 0)"
               : ""
             }
  >
    <path d="
      M5,5
      L5,95
      H95
      L95,5
      z" opacity="0" />
    <path d="
      M10,10
      L90,50
      L10,90
      z" />
  </g>
)



class NavBar extends Component{
  constructor(props) {
    super(props)

    // console.log("NavBar", props.slideIndex)

    this.chooseSlide = props.chooseSlide
    // this.slideIndex  = props.slideIndex
    this.lastIndex   = props.lastIndex

    this.arrowClick  = this.arrowClick.bind(this)
  }


  arrowClick(event) {
    let target = event.target
    let className
      , index

    while (target.tagName !== "DIV") {
      className = target.className || className
      target = target.parentNode
    }

    if (typeof className === "object") {
      className = className.baseVal
    }

    const regex = /\b((?:back)|(?:next))-button\b/
    const match = regex.exec(className)
    if (match) {
      className = match[1]
    }


    switch (className) {
      case "back":
        index = Math.max(0, this.props.slideIndex - 1)
      break
      case "next":
        index = Math.min(this.props.slideIndex + 1, this.lastIndex)
    }

    this.chooseSlide(index)
  }


  render() {
    const { slideIndex, lastIndex } = this.props
    const backDisabled = slideIndex === 0
    const nextDisabled = slideIndex === lastIndex

    // console.log("Arrow backDisabled:", backDisabled, "nextDisabled:", nextDisabled)

    return (
      <StyledNavBar>
        <StyledNavButton
          className="back-button"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"

          direction="back"
          disabled={backDisabled}
          onClick={this.arrowClick}
        >
          <Arrow
            direction="back"
          />
        </StyledNavButton>
        <StyledNavButton
          className="next-button"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"

          direction="next"
          disabled={nextDisabled}
          onClick={this.arrowClick}
        >
          <Arrow />
        </StyledNavButton>
      </StyledNavBar>
    )
  }
}



export default class Menu extends Component {
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
    let {open, active, aspectRatio, slideIndex, items} = this.props
    let openMenu = null
      , toggleOver = null
      , chooseSlide = null
      , showNavBar

    if (active) {
      openMenu = this.openMenu
      toggleOver = this.toggleOver
      chooseSlide = this.chooseSlide
      showNavBar = true // ('ontouchstart' in document.documentElement)
    }

    slideIndex = parseInt(slideIndex, 10)

    const navBar = showNavBar
                 ? <NavBar
                     chooseSlide={this.chooseSlide}
                     slideIndex={slideIndex}
                     lastIndex={items.length - 1}
                   />
                 : ""

    return <StyledMenuContainer
      className="show-menu-container"
    >
      {navBar}
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
        className="open-show-menu"
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