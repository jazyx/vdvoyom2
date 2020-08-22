/**
 * /public/Activities/Show/deck/menu.jsx
 *
 * 
 */


import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import { StyledShowMenu
       , StyledShowList
       , StyledShowItem
       , StyledSVG
       } from './styles'



const Items = (props) => {
  // console.log("ShowItems", props)

  // closeMenu: <function>
  // index: undefined
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


  const items = props.items.map(( item, index ) => {
    if (item.menu) {
      return <StyledShowItem
        key={item._id}
        onMouseUp={() => props.chooseSlide( index )}
        active={index === props.index}
      >
        {item.menu}
      </StyledShowItem>

    } else {
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

    this.state = { open: false }

    // this.openMenu()
    // setTimeout(this.closeMenu, CLOSE_MENU_DELAY)
  }


  openMenu(event) {
    if (this.ignoreOpen) {
      return
    }

    if (event) {
      this.setState({ open: true })

    } else {
      // The call came from the constructor
      this.state = { open: true }
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
      this.setState({ open: false })

      // Prevent the menu from reopening immediately if the click to
      // close was on the Icon

      this.ignoreOpen = true
      setTimeout(() => this.ignoreOpen = false, 100)

      const listener = this.closeMenu
      document.body.removeEventListener("touchstart", listener,true)
      document.body.removeEventListener("mousedown", listener, true)
    }
  }


  toggleOver(event) {
    const over = (event.type === "mouseenter")
    this.setState({ over })
  }


  chooseSlide(index) {
    this.props.setIndex(index)
    this.closeMenu()
  }


  render() {
    // console.log("Menu", this.props)

    // "items": [
    //   {
    //     "_id": "4pT9midTF7Dvjo5rY",
    //     "name": "splash",
    //     "image": {
    //       "splash": "/Assets/Show/OatsAndBeans/image/splash.jpg"
    //     },
    //     "layout": "splash",
    //     "text": "25 September 2020\nJames Newton at\n[English Language Evenings III Moscow](http://elemoscow.net/location.html)"
    //   },
    //   {
    //     "_id": "iGsYEexQuLXPuEKEE",
    //     "name": "earth",
    //     "menu": "The Age of the Earth",
    //     "image": {
    //       "earth": "/Assets/Show/OatsAndBeans/image/earth.svg"
    //     },
    //     "layout": "solo",
    //     "tweak": {
    //       "background-color": "#fff",
    //       "color": "#000"
    //     }
    //   },
    //   {
    //     "_id": "dGRe2HrQ5TbYfasDe",
    //     "name": "first_plants",
    //     "menu": "The First Plants on Dry Land",
    //     "image": {
    //       "first_plants": "/Assets/Show/OatsAndBeans/image/first_plants.jpg"
    //     },
    //     "layout": "solo",
    //     "legend": [
    //       {
    //         "id": "first_plants",
    //         "legend": "Liverwort (A, B, C), moss (D) and hornwort (E)"
    //       }
    //     ],
    //     "tweak": {
    //       "background-color": "#fff",
    //       "color": "#000"
    //     }
    //   }
    // ]

    // return <StyledShowMenu>
    //   Show menu goes here
    // </StyledShowMenu>

    return <StyledShowMenu
        id="menu-items"
        open={this.state.open}
      >
        <Items
          index={this.props.index}
          items={this.props.items}
          pane={this.pane}

          chooseSlide={this.chooseSlide}
        />
        <StyledSVG
          id="openShowMenu"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"

          open={this.state.open}
          over={this.state.over}

          onClick={this.openMenu}
          onMouseEnter={this.toggleOver}
          onMouseLeave={this.toggleOver}
        >
          <Icon />
        </StyledSVG>
      </StyledShowMenu>
  }
}