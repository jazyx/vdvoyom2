/**
 * /imports/ui/profile/Teach.jsx
 */

import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data'
import { Session } from 'meteor/session'

import { teacher } from '../../tools/custom/teacher'

import { localize
       , getElementIndex
       , removeFrom
       , arrayOverlap
       } from '../../tools/generic/utilities'

import { StyledProfile
       , StyledPrompt
       , StyledUL
       , StyledLearner
       , StyledButton
       , StyledNavArrow
       , StyledButtonBar
       } from './styles'

import { methods } from '../../api/methods/mint'
const { toggleActivation } = methods

import collections from '../../api/collections/publisher'
const { UIText, User, Group } = collections



class Teach extends Component {
  constructor(props) {
    super(props)

    this.state = { selected: -1 }

    this.scrollTo = React.createRef()

    this.share = this.share.bind(this)
    this.toggleLearner = this.toggleLearner.bind(this)
    this.scrollIntoView = this.scrollIntoView.bind(this)

    // Allow Enter to accept the default/current language
    document.addEventListener("keydown", this.share, false)
    window.addEventListener("resize", this.scrollIntoView, false)

    teacher.restore()
  }


  share(event) {
    if (event && event.type === "keydown" && event.key !== "Enter") {
      return
    } else if (!this.state.selected < 0) {
      return
    }

    const group = this.props.groups[this.state.selected]

    teacher.join(group)
  }


  toggleLearner(event) {
    const selected = getElementIndex(event.target, "UL")
    if (selected === this.state.selected) {
      // A second click = selection
      return this.share()
    }

    this.setState({ selected })
    this.scrollFlag = true // move fully onscreen if necessary

  }


  getPhrase(cue, name) {
    const code = Session.get("native")
    if (name) {
      name = {"^0": name.replace(" ", "\xA0")} // non-breaking space
    }
    return localize(cue, code, this.props.uiText, name)
  }


  scrollIntoView() {
    const element = this.scrollTo.current
    if (element) {
      element.scrollIntoView({behavior: 'smooth'})
    }
  }


  getPrompt() {
    const prompt = this.getPhrase("select_students")

    return <StyledPrompt>
      {prompt}
    </StyledPrompt>
  }


  getGroups() {
    const groups = this.props.groups.map((group, index) => {
      const names = group.members.map(member => {
        // TODO: Show username greyed out if user is not logged_in
        const username = member.username
        return <p
          key={username}
        >
          {username}
        </p>
      })
      const selected = this.state.selected === index
      const ref = selected ? this.scrollTo : ""
      const disabled = !group.logged_in.length

      return <StyledLearner
        key={index}
        ref={ref}
        disabled={disabled}
        selected={selected}
        onMouseUp={this.toggleLearner}
      >
        {names}
      </StyledLearner>
    })

    return <StyledUL>{groups}</StyledUL>
  }


  getButtonBar() {
    const disabled = ( this.state.selected < 0 )
                   || !this.props.groups[this.state.selected]
                                        .logged_in.length
    const name = disabled
               ? undefined
               : this.props.groups[this.state.selected].group_name
    const prompt = this.getPhrase("share", name)

    return <StyledButtonBar>
      <StyledNavArrow
        invisible={true}
      />
      <StyledButton
        disabled={disabled}
        onMouseUp={this.share}
      >
        {prompt}
      </StyledButton>
      <StyledNavArrow
        invisible={true}
      />
    </StyledButtonBar>
  }


  render() {
    const prompt = this.getPrompt()
    const groups = this.getGroups()
    const buttonBar = this.getButtonBar()

    return <StyledProfile
      id="teach"
      onMouseUp={this.props.points}
      onMouseDown={this.props.points}
      onTouchStart={this.props.points}
      onTouchEnd={this.props.points}
    >
      {prompt}
      {groups}
      {buttonBar}
    </StyledProfile>
  }


  componentDidMount(delay) {
    // HACK: Not all images may have been loaded from MongoDB, so
    // let's wait a little before we scrollIntoView
    setTimeout(this.scrollIntoView, 200)
  }


  componentDidUpdate() {
    if (this.scrollFlag) {
      this.scrollIntoView()
      this.scrollFlag = false
    }
  }


  componentWillUnmount() {
    window.removeEventListener("resize", this.scrollIntoView, false)
    document.removeEventListener("keydown", this.share, false)
  }
}



class TeachTracker{
  getProps() {
    const teacher_id = Session.get("teacher_id")
    const d_code = Session.get("d_code")

    // Phrases
    const uiText = this.getUIText()
    const groups = this.getGroups(teacher_id, d_code)
    // console.log(groups)

    const props = {
      uiText
    , groups
    , d_code
    }

    return props
  }


  getUIText() {
    const select = {
      $or: [
        { cue: "select_students" }
      , { cue: "share" }
      ]
    }
    const uiText = UIText.find(select).fetch()

    return uiText
  }


  getGroups(teacher_id, d_code) {
    // Group records have the format:
    // {
    //   "_id" :       "Q6Sb6WsfokFdf5Ccw",
    //
    //   "owner" :     "aa",
    //   "language" :  "ru",
    //   "active" :    false,
    //   "lobby" :     "",
    //   "chat_room" : "",
    //
    //   "members" :   [ <user_id>,     ...,    <teacher_id> ],
    //   "logged_in" : [ <user d_code>, ... <teacher d_code> ]
    //
    // }

    // We will return a filtered list with the format
    // [ { _id: <>
    //   , page: {
    //       view: <>
    //     , path: <>
    //     , tag: <>
    //     , data: { ... }
    //     }
    //   , members: [
    //       { _id: <user_id>
    //       , username: <string>
    //       , logged_in: <boolean>
    //       }
    //     , ...
    //     ]
    //   }
    // , ...
    // ]

    // Get a list of Groups that the Teacher owns, with their members
    // (which will include the Teacher), logged_in details and view.
    // Sort the groups so that groups with logged_in users appear first


    const query = { owner: teacher_id }
    const options = {
      fields: {
        members: 1
      , logged_in: 1
      , page: 1
      }
    }
    let groups = Group.find(query, options)
                       .fetch()
                       .sort((a, b) => ( // non-zero lengths first
                           ( b.logged_in.length > 1)
                         - ( a.logged_in.length > 1)
                        ))

    // console.log( "groups:", groups,
    //   "   <<<   db.group.find("
    // , JSON.stringify(query)
    // , ","
    // , JSON.stringify(options.fields)
    // , ").pretty()"
    // )

    const user_ids = this.getUniqueValues(groups, "members", teacher_id)
    const userMap  = this.getUserMap(user_ids)
    this.addUserNamesTo(groups, userMap, teacher_id)

    return groups
  }


  getUniqueValues(groups, key, exclude) {
    const reducer = (reduced, group) => (
       [...reduced, ...group[key]]
    )

    const uniqueValues = (value, index, array) => (
      array.indexOf(value) === index
    )

    const output = groups.reduce(reducer, [])
                         .filter(uniqueValues)
    removeFrom(output, exclude)

    return output
  }


  getUserMap(user_ids) {
    const map = {}
    const options = { fields: { username: 1, logged_in: 1 }}

    user_ids.forEach(_id => {
      const user = User.findOne({ _id }, options)
      map[_id] = user
    })

    return map
  }


  addUserNamesTo(groups, userMap, exclude) {
    groups.forEach(group => {
      const logged_in = group.logged_in
      const members  = group.members.filter( _id => _id !== exclude )
                                    .map( _id => {
        const userData     = userMap[_id] // vvv array vvv
        const overlap      = arrayOverlap(userData.logged_in, logged_in)
        userData.logged_in = overlap.length // <<< Boolean

        return userData
      })

      group.members = members
    })
  }
}



const tracker = new TeachTracker()



export default withTracker(() => {
  return tracker.getProps()
})(Teach)
