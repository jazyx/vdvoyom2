/**
 * /imports/ui/Menu.jsx
 *
 * The Menu consists of three parts:
 * 1. A full-height background that slides in and out
 * 2. A list of clickable item that is a child of the background
 * 3. A hamburger icon which:
 *    • Is always visible
 *    • Slides out in sync with the background when the background's
 *      right edge is flush with the icon's right edge
 *    • Slides back in in sync with the background, until the
 *      background's right edge is less than the icon's width
 *    • Becomes semi-transparent when the background is not showing
 *    • Brightenes to full opacity when the background slides out
 * Clicking on the hamburger icon makes the background slide out or
 * back in again. Clicking anywhere outside the background while it
 * is visible will make it slide back in again.
 *
 * Clicking on on of the clickable items in the list will trigger
 * that item and slide the menu back in.
 */


import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data'

import styled, { css } from 'styled-components'
import { Session } from 'meteor/session'

import Storage from '../tools/generic/storage'
import { localize
       , getLocalized
       } from '../tools/generic/utilities'
import { getIconSrc } from '../tools/custom/project'
import { SET_REGEX } from '../tools/custom/constants'


import { methods } from '../api/methods/mint'
const { logOut, setIndex , setPath, toggleMenu } = methods

import collections from '../api/collections/publisher'
const { UIText, Group, Activity } = collections


const COLORS = {
  fillColor: "#fff"
, strokeColor: "#000"
, menu: "rgba(17,17,17,0.9)"
}
const CLOSE_MENU_DELAY = 1000



const StyledControls = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: calc(100 * var(--h));
  z-index: 1;
  text-align: left;
`


const StyledSVG = styled.svg`
  position: absolute;
  width: calc(15 * var(--min));
  height: calc(15 * var(--min));
  fill: ${COLORS.fillColor};
  stroke: ${COLORS.strokeColor};
  opacity: ${props => (
    props.open ? 1 : (props.over ? 0.75 : 0.25)
  )};
  top: 0;
  left: ${props => props.open
                 ? "calc(45 * var(--min));"
                 : 0};
  transition: left .3s linear, opacity .1s;
  transition-property: left, opacity;
  transition-delay: ${props => props.open ? ".1s, 0s;" :"0s, .3s;"}
  `


const StyledMenu = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  top: 0;
  left: ${props => props.open
                 ? 0
                 : "calc(-60 * var(--min));"
         };
  ${props => props.open
           ? `box-shadow: 0 0 calc(3 * var(--min)) 0
              rgba(0,0,0,0.75);
             `
           : ""
   }
  height: calc(100 * var(--h));
  width: calc(60 * var(--min));
  padding: calc(2 * var(--min));
  padding-top: calc(15 * var(--min));
  padding-bottom: 0;
  background-color: ${COLORS.menu};

  transition: left .40s linear;
`


const StyledList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: 100%;
  overflow: auto;
  ${props => props.noShrink
           ? `flex-shrink: 0;
              max-height: calc(72 * var(--min));
             `
           : ""
   }

  & li {
    margin: calc(1 * var(--min)) 0;
  }
  & button {
    display: flex;
    align-items: center;
    font-size: calc(3.6 * var(--min));
    border-radius: 10vmin;
    border-color: #999;
    background-color: rgba(0,0,0,0.5);
    color: #fff;
    width: 100%;
    overflow: hidden;
    border-width: calc(0.25 * var(--min));
  }
  & button:focus {
    outline: none;
  }
  & button:disabled {
    opacity: 0.25;
  }
  & img {
    width: calc(8 * var(--min));
  }
  & span {
    width: calc(100% - 8 * var(--min));
    padding: 0 calc(1 * var(--min));
  }
`



class BreadCrumbs extends Component {
  constructor (props) {
    super(props)

    this.showActivity = this.showActivity.bind(this)
  }


  showActivity(index) {
    const options = {
      group_id: Session.get("group_id")
    , index
    }

    setIndex.call(options)
    this.props.closeMenu()
  }


  getItems() {
    const selectedIndex = this.props.index
    const items = this.props.items.map((item, index) => {
      // console.log("Menu item:", item, "index:", index)

      return (
        <li
          key={item.path}
        >
          <button
            onMouseUp={() => this.showActivity(index)}
            selected={index === selectedIndex}
          >
            <span>
              {item.name}
            </span>
            <img
              src={item.icon}
              alt={item.name}
            />
          </button>
        </li>
      )
    })

    return items
  }


  render() {
    const items = this.getItems()

    return (
      <StyledList
        noShrink={true}
      >
        {items}
      </StyledList>
    )
  }
}



class Profile extends Component {
  constructor(props) {
    super(props)

    this.state = { showPIN: false }
    this.togglePIN = this.togglePIN.bind(this)
  }


  togglePIN(event) {
    const showPIN = ["mousedown", "touchstart"].includes(event.type)
    this.setState({ showPIN })
  }


  getItems() {
    const code = Session.get("native")
    const actions = [
      () => this.props.setPage("Teacher")
    , () => this.props.setPage("Native")
    , this.togglePIN
    , () => this.props.setPage("Name")
    ]

    let items = [
      "change_course"
    , "change_interface_language"
    , "view_pincode"
    , "log_out"
    ]

    items = items.map(cue => (
      this.props.uiText.find(item => item.cue === cue)
    ))

    items = items.map((item, index) => {
      const src = item.icon
      const text = (item[code] || item.en).replace(/_/g, " ")
      let q_code
        , action

      if (item.cue === "view_pincode") {
        if (this.state.showPIN) {
          q_code = Session.get("q_code")
        }

        action = this.togglePIN
      }

      return (
        <li
          key={item.cue}
        >
          <button
            disabled={false}
            onMouseUp={actions[index]}
            onMouseDown={action}
          >
            <img
              src={src}
              alt={text}
            />
            <span>{q_code || text}</span>
          </button>
        </li>
      )
    })

    return items
  }


  render() {
    const items = this.getItems()

    return (
      <StyledList>
        {items}
      </StyledList>
    )
  }
}



const Items = (props) => {
  return <StyledMenu
    ref={props.pane}
    open={props.open}
  >
    <BreadCrumbs
      index={props.index}
      items={props.items}
      setPage={props.setPage}
      closeMenu={props.closeMenu}
    />
    <hr
      style={{
        width: "100%"
      , borderColor: "#666"
      , margin: 0
      }}
    />
    <Profile
      uiText={props.uiText}
      setPage={props.setPage}
    />
  </StyledMenu>
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
      H85
      a 10 10 180 0 1 0 20
      H15
      a 10 10 180 0 1 0 -20
      z" />
    <path d="
      M15,70
      H85
      a 10 10 180 0 1 0 20
      H15
      a 10 10 180 0 1 0 -20
      z" />
  </g>
)



class Menu extends Component {
  constructor(props) {
    super(props)

    this.pane = React.createRef()

    this.callback = props.callback // <<<<<

    this.openMenu = this.openMenu.bind(this)
    this.closeMenu = this.closeMenu.bind(this)
    this.toggleOver = this.toggleOver.bind(this)
    this.state = { open: true }

    this.logOut = this.logOut.bind(this)
    window.addEventListener("beforeunload", this.logOut, false)

    this.openMenu()
    setTimeout(this.closeMenu, CLOSE_MENU_DELAY)
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
    const _id = this.props.group_id
    if (!_id) {
      return
    }

    toggleMenu.call({
      _id
    , menu_open
    })
  }


  toggleOver(event) {
    const over = (event.type === "mouseenter")
    this.setState({ over })
  }


  logOut() {
    // Prepare to delete both the user and the group if the user is
    // temporary. See getURLQueryData() for the creation of the temp
    // username
    const regex = /deleteTempUser_[A-Za-z0-9&#]+/
    const remove = regex.test(Session.get("username"))

    // console.log(
    //   "Logging out user", Session.get("username")
    // , "remove:", remove
    // )

    // The user may be both a teacher and a learner. The user_id
    // for a learner may have been read in from localStorage, but
    // the teacher_id is not stored, so if it is present, this
    // user logged in as a teacher.

    const id = Session.get("teacher_id") || Session.get("user_id")
    const d_code = Session.get("d_code")

    if (!(id && d_code)) {
      // id and d_code will not be set unless basic profile is
      // completed on first use of this device or after localStorage
      // has been disabled

      return
    }

    // const group_id = Session.get("group_id")
    const userAndDevice = { id, d_code, remove } //, group_id }

    logOut.call(userAndDevice) // no callback = synchronous
  }


  render() {
    if (!this.props.uiText.length) {
      // The chances are that the connection timed out before loading
      // the UIText collection, or that the app was hot reloaded so
      // the collection had not yet had time to load. As a result
      // there's nothing for the menu to
      // console.log("No phrases for UI")

      return ""

    } else if (this.props.isPilot === false) {
      return ""
    }

    // console.log(JSON.stringify(this.props, null, "  "))
    // if (this.props.hide) {
      // return ""
    // }

    return <StyledControls
        id="menu-items"
      >
        <Items
          pane={this.pane}
          open={this.props.menu_open}

          index={this.props.index}
          items={this.props.items}
          uiText={this.props.uiText}

          setPage={this.props.setPage}
          closeMenu={this.closeMenu}
        />
        <StyledSVG
          id="openMenu"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"

          open={this.props.menu_open}
          over={this.state.over}

          onClick={this.openMenu}
          onMouseEnter={this.toggleOver}
          onMouseLeave={this.toggleOver}
        >
          <Icon />
        </StyledSVG>
      </StyledControls>
  }
}



class MenuTracker{
  getProps() {
    const group_id = Session.get("group_id")
    const uiText  = this.getUIText()
    const { page, menu_open, isPilot } = this.getGroupData()
    const { path, index } = page
    const items   = this.getItems(path, uiText)

    const props = {
      uiText
    , path
    , index
    , items
    , group_id
    , menu_open
    , isPilot
    }

    return props
  }


  getUIText() {
    const select = {
      $or: [
        { cue: "all_activities" }
      , { cue: "change_course" }
      , { cue: "change_interface_language" }
      , { cue: "view_pincode" }
      , { cue: "log_out" }
      ]
    }
    const uiText = UIText.find(select).fetch()

    // console.log( "uiText:", uiText
    //            , "<<<   db.uitext.find("
    //            + JSON.stringify(select)
    //            + ")"
    //            )

    return uiText
  }


  getGroupData() {
    const group_id = Session.get("group_id")
    const d_code = Session.get("d_code")

    if (group_id) {
      const groupSelect = { _id: group_id }
      const groupProject = {
        fields: {
          page: 1
        , menu_open: 1
        , soloPilot: 1
        }
      }
      const groupData = Group.findOne(groupSelect, groupProject)

      // console.log(
      //   "Menu group_id:", group_id, ", groupData"
      // , JSON.stringify(groupData, null, "  ")
      // )

      var {
        page
      , menu_open
      , soloPilot
      } = groupData || {}
    }

    if (!page) {
      page = {}
    }

    if (!page.path) {
      page = {
         ...page
      , ...{
          path: ""
        , index: 0
        // view will not be used
        }
      }
    }

    // isPilot should be undefined if soloPilot is not defined,
    // true if this user/teacher is the soloPilot, false if not
    const isPilot = soloPilot
                  ? soloPilot === d_code
                  : undefined

    return { page, menu_open, isPilot }
  }


  /**
   * Gets the items.
   *
   * @param      {string}  path     "/Game/set/match"
   * @param      {object}  uiText   [ { cue: "all_activities"
   *                                  , "en": "text"
   *                                  , "ru": "текст"
   *                                  , ...
   *                                  }
   *                                , ...
   *                                ]
   * @return     {array} [ {...} ]
   */
  getItems(path, uiText) {
    const lang = Session.get("native")
    const sets = path
               ? path.split(SET_REGEX) // [""] || ["/Game", "/set"]
               : []
    const collectionName = (sets[0] || "").substring(1)

    const getItemArray = (item, index) => { // item is not used
      const path = sets.slice(0, index + 1).join("")
      // "/Game", "/Game/set", "/Game/set/match", ...
      const select = { path }
      const options = {
        fields: {
          icon: 1
        , name: 1
        }
      }
      const source = index
                   ? collections[collectionName]
                   : Activity
      const setData = source.findOne(select, options)

      if (!setData) {
        // This occurs when the app does a hot reload after changing
        // code during development. The Menu component is already
        // loaded, but the app has not yet connected to the Activity
        // collection. We'll simply skip the items for this render.

        return 0

        // console.log( "setData:", setData)
        // console.log( ` <<<< db.${source._name}.findOne(`
        //            + JSON.stringify(select)
        //            + ","
        //            + JSON.stringify(options.fields)
        //            + ")"
        //            )
      }
      const icon = getIconSrc(setData.icon, lang)
      const name = getLocalized(setData.name, lang)

      return {
        name
      , path
      , icon
      }
    }

    const items = sets.map(getItemArray)
                      .filter(item => !!item)

    const name = localize("all_activities", lang, uiText)
    items.unshift({
      name
    , path: ""
    , icon: "/Activities/icon.jpg"
    })

    return items
  }
}


const menuTracker = new MenuTracker()


export default withTracker(() => {
  return menuTracker.getProps()
})(Menu)