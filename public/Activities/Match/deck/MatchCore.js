/**
 * /public/activities/Match/deck/MatchCore.jsx
 *
 *
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { valuesDontMatch
       , shuffle
       , getElementIndex
       , removeFrom
       } from '/imports/tools/generic/utilities'

import { StyledContainer
       , StyledFrame
       , StyledButton
       , StyledList
       , StyledThumbnail
       , StyledControls
       , StyledLock
       , StyledParticipants
       , StyledScoreData
       } from './styles'

import { forceSelect
       , userMatch
       } from '../methods'



/// DEBUGGING // DEBUGGING // DEBUGGING // DEBUGGING // DEBUGGING ///
import { logRenderTriggers } from '/imports/tools/generic/debug.js'


const hoverDelay = 2000 //ms before button switches to toggled display



export default class Match extends Component {
  constructor(props) {
    super(props)

    this.named = props.items.named
    this.anon = [...props.items.anon]
    shuffle(this.anon)

    this.state = {
      anon: 0
    , named: 0
    , "anon-locked": false
    , "named-locked": false
    , "showHover": false
    }

    this.forcedName     = undefined
    this.nameJustForced = false
    this.forcedAnon     = undefined
    this.anonJustForced = false

    this.selectImage = this.selectImage.bind(this)
    this.toggleMatch = this.toggleMatch.bind(this)
    this.toggleFullScreen = this.toggleFullScreen.bind(this)
    this.toggleLock = this.toggleLock.bind(this)
    this.toggleHover = this.toggleHover.bind(this)
  }


  selectImage(event) {
    const type = this.getType(event.currentTarget) // named | anon
    const index = getElementIndex(event.target)
    const [ array, other ] = type === "anon"
                           ? [ this.anon, "named" ]
                           : [ this.named, "anon" ]

    const set = { [type]: index }

    if (type === "named") {
      const matches    = array[index].matches // named matches
      const pairedWith = this.getPairedImageIndex(other, matches)
      // index of anon image paired with this named image

      if (pairedWith < 0) {
        // This named image has no match, but the anon image might
        this.ensureThatAnonImageIsNotPaired(set)

      } else {
        set[other] = pairedWith
      }
    }

    this.setState(set)

    // Teacher only
    if (this.state[type+"-locked"]) {
      this.forceSelect(type, true, index)
    }
  }


  toggleMatch(event) { // event is not used
    const named = this.getMatches("named")
    let pairedWith = this.state[named] // string or undefined
    const anon = this.anon[this.state.anon].matches
    const anonPair = this.getPairedImage("named", anon)

    const pairs = {}

    if (pairedWith && pairedWith === anon) {
      pairs[named] = 0

    } else {
      if (anonPair) {
        pairs[anonPair] = 0
      }

      pairs[named] = anon
    }

    this.shareMatch(pairs)

    pairs.showHover = false
    this.setState(pairs)
  }


  toggleFullScreen(event) {
    const type = this.getType(event.currentTarget)
    const fullScreen = (this.state.fullScreen)
                     ? undefined
                     : type
    this.setState({ fullScreen })
  }


  toggleHover(event) {
    const showHover = (event.type === "mouseenter")
    this.setState({ showHover })
  }


  getPairedImage(type, matches) {
    let pair

    if (type === "anon") {
      pair = this.state[matches] // may be undefined

    } else {
      const names = this.getKeysFromState()

      names.every(name => {
        if (this.state[name] === matches) {
          pair = name
          return false
        } else {
          return true
        }
      })
    }

    return pair
  }


  getPairedImageIndex(type, matches) {
    const array = this[type]
    const pair = this.getPairedImage(type, matches)

    return array.findIndex( item => item.matches === pair )
  }


  ensureThatAnonImageIsNotPaired(set) {
    const array = this.anon
    let index = this.state.anon

    // Get matches for anon image
    let matches = array[index].matches
    // Find if a named image is matched with this anon image
    let named = this.getPairedImage("named", matches)

    if (named) {
      // Find the next unmatched named image
      const total = array.length
      let pair

      do {
        if (++index === total) {
          index = 0
        }

        matches = array[index].matches
        named = this.getPairedImage("named", matches)

      } while (named)

      set.anon = index
    }
  }


  getKeysFromState() {
    const removeUndefined = key => this.state[key] === undefined
    const notMatches = [
      "anon"
    , "named"
    , "anon-locked"
    , "named-locked"
    , "showHover"
    , removeUndefined
    ]
    const keys = Object.keys(this.state)
    removeFrom(keys, notMatches, true)

    return keys
  }


  getMatches(type) {
    // Check if there is a force choice of named
    let matches = this.props.data
                ? this.props.data[type]
                : undefined
    if (!matches) {
      const index = this.state[type]
      matches = this[type][index].matches
    }

    return matches
  }


  shareMatch(pairs) {
    const group_id = this.props.group_id
    const user_id = this.props.user_id
    const options = {
      group_id
    , user_id
    , pairs
    }

    userMatch.call(options)
  }


  /** <<< Only called by teacher
   *
   * @param      {<type>}  event   The event
   */
  toggleLock(event) {
    const type = this.getType(event.target)
    const key  = type + "-locked"
    const locked = !this.state[key]
    const index = this.state[type]

    this.forceSelect(type, locked, index)
    this.setState({ [key]: locked })
  }


  forceSelect(type, locked, index) {
    const group_id = this.props.group_id
    const options = {
      group_id
    , type
    }
    if (locked) {
      options.matches = this[type][index].matches
    }

    forceSelect.call(options)
  }


  getParticipants(type) {
    // fullname > selected pair > right/paired > recognized

    // console.log(
    //   "this.props.users"
    // , JSON.stringify(this.props.users, null, "  ")
    // )

    const index    = this.state.named
    const selected = this.named[index].matches
    const matches  = this.props.data
                   ? this.props.data.matches || {}
                   : {}

    const participants = this.props.users.map( userData => {
      const pairs   = matches[userData._id] || {}
      const current = pairs[selected]
      const correct = current === selected

      let paired = Object.keys(pairs)
      const right = paired.reduce(( count, named ) => {
        if (named === pairs[named]) {
          count++
        }

        return count
      }, 0)

      paired = paired.length
      const recognized = "-"

      return (
        <li
          key={userData._id}
        >
          <StyledScoreData
            key="name"
            col="name"
          >
            {userData.fullname}
          </StyledScoreData>
          <StyledScoreData
            key="current"
            col="current"
            correct={correct}
          >
            {current}
          </StyledScoreData>
          <StyledScoreData
            key="score"
            col="score"
          >
            {right + "/" + paired}
          </StyledScoreData>
          <StyledScoreData
            key="recognized"
            col="recognized"
          >
            {recognized}
          </StyledScoreData>
        </li>
       )
    })

    return <StyledParticipants
      className="teacher"
    >
      {participants}
    </StyledParticipants>
  }
  /// Only called by teacher >>>


  getType(element) {
    const className = element.className
    const regex = /((named)|(anon))/
    const match = regex.exec(className)
    if (match) {
      return match[1]
    }
  }


  getThumbnails(array, top, isTeacher) {
    const keys = this.getKeysFromState()
    const values = keys.map(key => this.state[key])

    const className = top
                    ? "named"
                    : "anon"

    // console.log("thumbnails keys:", keys, "values:", values)
    const forced = (this.props.data || {})[className]
    //             matches | undefined

    const thumbnails = array.map((item, index) => {
      // console.log("thumbnail item", item)
      // index:   0 for anon | 1 for named
      // matches: <string folder name>
      // src:     <url>
      // text:    <folder name or custom string>

      const selected = this.state[className] === index
      const isForced = item.matches === forced

      const text = top || isTeacher
                 ? <span>{item.text}</span>
                 : ""

      const paired = top
                   ? !(keys.indexOf(item.matches) < 0)
                   : !(values.indexOf(item.matches) < 0)

      // console.log("className:", className, "matches:", item.matches, "selected:", selected, "paired:", paired)

      return <StyledThumbnail
        key={item.text}
        selected={selected}
        paired={paired}
        forced={isForced}
      >
        <img
          src={item.src}
        />
        {text}
      </StyledThumbnail>
    })

    if (isTeacher) {
      const locked = this.state[className+"-locked"]

      return <StyledControls
        className="teacher"
      >
        <StyledList
          top={top}
          className={className}
          onClick={this.selectImage}
          locked={locked}
        >
          {thumbnails}
        </StyledList>
        <StyledLock
          className={className}
          locked={locked}
          onClick={this.toggleLock}
        />
      </StyledControls>

    } else {
      return <StyledList
        top={top}
        className={className}
        onClick={this.selectImage}
        forced={!!forced}
      >
        {thumbnails}
      </StyledList>
    }
  }


  getComparison() {
    let {
      named, anon  // index
    , fullScreen
    } = this.state

    // Overwrite with selections in props, created by teacher
    let {
      named: namedMatch
    , anon: anonMatch
    } = this.props.data || {} // matches
    let pair

    if (namedMatch && this.nameJustForced) {
      // Use index of forced match instead of user selection
      named = this.named.findIndex(
        item => item.matches === namedMatch
      ) 

      if (!anonMatch) {
        // Select the image paired by the user, if there is one
        pair = this.getPairedImageIndex("anon", namedMatch)
        if (pair < 0) {
          // The forced named image has not been paired by this user.
          // If the anon image selected by the user _is_ paired with
          // some other named image, we need to choose a different
          // anon image
          pair = {}
          this.ensureThatAnonImageIsNotPaired(pair) // ads {anon: <>}
          anon = pair.anon || anon

        } else {
          anon = pair
        }
      }
    }

    if (anonMatch && this.anonJustForced) {
      anon = this.anon.findIndex(item => item.matches === anonMatch)

      if (!namedMatch) {
        pair = this.getPairedImageIndex("named", anonMatch)
        if (pair < 0) {
          //
        } else {
          named = pair
        }
      }
    }

    // Store new forced named/anon, if it only just changed
    this.nameJustForced = ( namedMatch !== this.forcedName )
                       && !!namedMatch
    this.forcedName     = namedMatch
    this.anonJustForced = ( anonMatch !== this.forcedAnon )
                       && !!anonMatch
    this.forcedAnon     = anonMatch

    // console.log(
    //   "this.state"
    // , JSON.stringify(this.state, null, "  ")
    // , "named:", named
    // , "paired:", paired
    // )

    named = this.named[named] || {} //fallback if hot reload
    anon  = this.anon[anon]   || {} // fallback if hot reload
    const status = this.getStatusOfSelectedImages(named, anon)

    named = <img src={named.src} alt={named.text} />
    anon  = <img src={anon.src} alt={anon.text} />

    return <div

    >
      <StyledFrame
        className={( fullScreen === "named" )
                   ? "named fullscreen"
                   : "named"
                   }
        onClick={this.toggleFullScreen}
      >
        {named}
      </StyledFrame>
      <StyledFrame
        className={( fullScreen === "anon" )
                   ? "anon fullscreen"
                   : "anon"
                   }
        onClick={this.toggleFullScreen}
      >
        {anon}
      </StyledFrame>
      <StyledButton
        onClick={this.toggleMatch}
        onMouseEnter={this.toggleHover}
        onMouseLeave={this.toggleHover}
        showHover={this.state.showHover}
        status={status}
      />
    </div>
  }


  getStatusOfSelectedImages(named, anon) {
    const showHover    = this.state.showHover
    const namedMatches = named.matches
    const anonMatches  = anon.matches
    const namedPair    = this.state[namedMatches]
    let anonPair       = this.getPairedImage("named", anonMatches)

    if (namedPair === anonMatches) {
      if (showHover) {
        return "break"
      } else {
        return "paired"
      }
    } else if (namedPair || anonPair) {
      if (showHover) {
        return "paired"
      } else {
        return "swap"
      }
    } else if (showHover) {
      return "paired"
    } else {
      return "unpaired"
    }
  }


  getTeacherControls(isTeacher) {
    if (!isTeacher) {
      return ""
    }

    return this.getParticipants()
  }


  render() {
    const triggered = logRenderTriggers("Match RenderTriggers", this)
    // console.log("MATCH TRIGGERED", triggered)

    // console.log(
    //   "this.state"
    // , JSON.stringify(this.state, null, "  ")
    // )
    // console.log(
    //   "this.props"
    // , JSON.stringify(this.props, null, "  ")
    // )


    const isTeacher = this.props.isTeacher
    const top = true
    const count = this.anon.length
    const named = this.getThumbnails(this.named, top, isTeacher)
    const anon  = this.getThumbnails(this.anon, !top, isTeacher)
    const compare = this.getComparison()

    const teacher = this.getTeacherControls(this.props.isTeacher)

    return (
      <StyledContainer
        count={count}
        aspectRatio={this.props.aspectRatio}
      >
        {named}
        {compare}
        {anon}
        {teacher}
      </StyledContainer>
    )
  }


  // shouldComponentUpdate(nextProps, nextState) {
  //   if ( valuesDontMatch(nextProps, this.props)
  //     || valuesDontMatch(nextState, this.state)
  //      ) {
  //     return true
  //   }

  //   return false
  // }


  /** Update this.state.named and ~anon to reflect this.props.data.~
   *
   * this.state will update as soon as the teacher forces a selection
   * but this.props will not have updated yet. So, on the teacher's
   * device only, this.state will first be reverted to the former
   * value given by this.props, then this.props will update, then
   * this.state will be synced. This will lead to 4 renders on the
   * teacher's device, but only 2 on the users'.
   */
  componentDidUpdate() {
    const set = {}
    const data = this.props.data
    if (!data) {
      return
    }

    let refresh = false

    let temp = data.named && this.named.findIndex(
      item => item.matches === data.named
    )
    if (!isNaN(temp) && (this.state.named !== temp)) {
      // this.props.named should overwrite this.state.named
      set.named = temp
      refresh = true
    }

    temp = data.anon && this.anon.findIndex(
      item => item.matches === data.anon
    )
    if (!isNaN(temp) && (this.state.anon !== temp)) {
      set.anon = temp
      refresh = true

    } else if (!data.named) {
      // Check if this.state.named is paired and restore pairing
      // if necessary

      const named = this.named[this.state.named].matches
      const anon  = this.state[temp]

      if (anon) {
        temp = this.anon.findIndex(item => item.matches === anon)
        if (this.state.anon !== temp) {
          set.anon = temp
          refresh = true
        }
      }
    }

    if (refresh) {
      console.log("Match refresh state:", set)
      this.setState(set)
    }
  }
}
