/**
 * public/activities/Drag/deck/DragCore.jsx
 *
 * Creates a layout with up to 6 images, each with a space below for
 * the name of the image, and up to six <p> elements, containing the
 * names.
 *
 * When no-one else is interacting with the shared screen, a user may
 * start to drag a name, by this action become the temporary pilot for
 * the activity. The pilot's mouse|touch (pointer) does not actually
 * move the name. The pointer moves and so defines the values this.x
 * and this.y, which represent the top-left corner of the dragged p
 * element relative to the gameFrame. These values are converted to
 * numbers between 0.0 and 1.0 and saved in the MongoDB database as
 *   { _id: <group_id>
 *   , "page.data": {
 *       x:       <0.0 - 1.0>
 *     , y:       <0.0 - 1.0>
 *     , drag_id: <id of dragged p element>
 *     , pilot;   <d_code> of this user's device>
 *     }
 *   }
 * The position of this user's pointer is transferred independently by
 * the Pointers component. The pointer position does not pass through
 * the MongoDB database, so it is not delayed. The Pointers component
 * may update the pointer more often than this Drag component updates
 * the position of the p element that it is dragging, so the p element
 * may appear to move jerkily while the pointer moves smoothly.
 *
 * On the pilot's screen, the dragName() method calculates the new
 * position of the dragged element, and sends this data to the
 * database. The actual position is set in the render() method.
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';
import styled, { css } from 'styled-components'

import { shuffle
       , getXY
       , setTrackedEvents
       } from '/imports/tools/generic/utilities'
// import Sampler from '/imports/tools/generic/sampler'

import { setViewData
       , setDragTarget
       , updateDragTarget
       , dropDragTarget
       , toggleShow
       , toggleComplete
       } from '../methods'



/**
 * Generate Portrait, Landscape, Ratio, PortraitRatio, LandscapeRatio
 */
const { P, L, R, PR, LR } = (function portraitAndLandscapeSizes() {
  // Define sizes in multiples of the vertical gap between columns
  const space = 10
  const text  = 20
  const image = 75

  const portraitWidthDivisions   = 2 * image + 1
  const portraitHeightDivisions  = 3 * image + 3 * space + 6 * text
  const landscapeWidthDivisions  = 3 * image + 2
  const landscapeHeightDivisions = 2 * image + 2 * space + 4 * text

  // We will flip from portrait mode to landscape mode when
  // width/landscapeWidthDivisions = height/portraitHeightDivisions
  const R = landscapeWidthDivisions / portraitHeightDivisions
  const PR = portraitWidthDivisions / portraitHeightDivisions
  const LR = landscapeWidthDivisions / landscapeHeightDivisions
  const frame = image + text + space

  const L = { // units to be multiplied by var(--w)
    frame: frame * 100 / landscapeWidthDivisions
  , image: image * 100 / landscapeWidthDivisions
  , text:  text  * 100 / landscapeWidthDivisions
  , space: space * 100 / landscapeWidthDivisions
  //
  , iMax:  image * 100 / landscapeHeightDivisions
  , fMax:  frame * 100 / landscapeHeightDivisions
  , tMax:  text  * 100 / landscapeHeightDivisions
  }

  const P = { // units to be multiplied by var(--h)
    frame: frame * 100 / portraitHeightDivisions
  , image: image * 100 / portraitHeightDivisions
  , text:  text  * 100 / portraitHeightDivisions
  , space: space * 100 / portraitHeightDivisions
  //
  , iMax:  image * 100 / portraitWidthDivisions
  , fMax:  frame * 100 / portraitWidthDivisions
  , tMax:  text  * 100 / portraitWidthDivisions
  }

  return { P, L, R, PR, LR }
})()

// console.log("P:", P,"L:", L,"R:", R)



const StyledContainer = styled.div`
  width: calc(100 * var(--w));
  height: calc(100 * var(--h));
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: calc(4 * var(--w));
  background-color: #fff;
  color: #000;

  ${props => (props.aspectRatio > PR)
   ? `font-size: calc(4 * ${R} * var(--h));
     `
   : ""
  }

  ${props => (props.aspectRatio > R)
   ? `font-size: calc(4 * var(--w));
     `
   : ""
  }

  ${props => (props.aspectRatio > LR)
   ? `font-size: calc(4 * ${LR} * var(--h));
     `
   : ""
  }
`


const StyledFrameSet = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-around;
`


const StyledColumn = styled.div`
  width: calc(${P.image} * var(--h));
  display: flex;
  flex-direction: column;
  align-items: center;

  ${props => (props.aspectRatio > R)
   ? `width: calc(${L.image} * var(--w));
     `
   : ""
   }
`


const StyledFrame = styled.div`
  width: calc(${P.image} * var(--h));
  height: calc(${P.frame} * var(--h));
  max-width: calc(${P.iMax} * var(--w));
  max-height: calc(${P.fMax} * var(--w));
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  float: left;
  background: #fff;

  ${props => (props.aspectRatio > R)
   ? `width: calc(${L.image} * var(--w));
      height: calc(${L.frame} * var(--w));
      max-width: calc(${L.iMax} * var(--h));
      max-height: calc(${L.fMax} * var(--h));
     `
   : ""
   }
`


const StyledSquare = styled.div`
  width: calc(${P.image} * var(--h));
  height: calc(${P.image} * var(--h));
  max-width: calc(${P.iMax} * var(--w));
  max-height: calc(${P.iMax} * var(--w));
  background: url(${props => props.src});
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;

  ${props => (props.aspectRatio > R)
   ? `height: calc(${L.image} * var(--w));
      width: calc(${L.image} * var(--w));
      max-width: calc(${L.iMax} * var(--h));
      max-height: calc(${L.iMax} * var(--h));
     `
   : ""
  }
`


const StyledName = styled.p`
  width: 100%;
  height: calc(${P.text} * var(--h));
  max-height: calc(${P.tMax} * var(--w));
  text-align: center;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;

  margin: 0.15em 0 0;
  ${props => props.show
           ? `border: none;
              opacity: 1;
              color: #000;
             `
           : `border: 0.05em dashed #999;
              color: #fff;
             `
  }

  ${props => (props.aspectRatio > R)
   ? `height: calc(${L.text} * var(--w));
      max-height: calc(${L.tMax} * var(--h));
     `
   : ""
  }
`


const StyledNames = styled.div`
  position: absolute;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  width: 100%;
  text-align: center;

  & div {
    display: flex;
    justify-content: center;
  }

  ${props => (props.aspectRatio > R)
   ? `grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
     `
   : ""
  }
`


const StyledDraggable = styled.p`
  position: relative;
  margin: 0.05em;
  box-sizing: border-box;
  border: 0.05em dashed #888;
  cursor: pointer;
  height: calc(${P.text} * var(--h));
  width: calc(${P.image} * var(--h));
  max-height: calc(${P.tMax} * var(--w));
  max-width: calc(${P.iMax} * var(--w));
  display: flex;
  justify-content: center;
  align-items: center;

  ${props => (props.aspectRatio > R)
   ? `height: calc(${L.text} * var(--w));
      width: calc(${L.image} * var(--w));
      max-height: calc(${L.tMax} * var(--h));
      max-width: calc(${L.iMax} * var(--h));
     `
   : ""
  }

   &.drag {
     background: rgba(255, 0, 0, 0.5);
     color: #fff;
   }

   &.dropped {
     opacity: 0;
     cursor: default;
   }
`


const StyledDragged = styled.p`
  position: fixed;

  width: 48%;
  height: 1.4em;
  text-align: center;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;

  margin: 0.05em 0.3em;
  box-sizing: border-box;
  border: 0.05em dashed #888;
  cursor: grabbing;
  background: rgba(255, 0, 0, 0.5);
  color: #000;

  left: ${props => props.x};
  top: ${props => props.y};

  height: calc(${P.text} * var(--h));
  width: calc(${P.image} * var(--h));
  max-height: calc(${P.tMax} * var(--w));
  max-width: calc(${P.iMax} * var(--w));

  ${props => (props.aspectRatio > R)
   ? `height: calc(${L.text} * var(--w));
      width: calc(${L.image} * var(--w));
      max-height: calc(${L.tMax} * var(--h));
      max-width: calc(${L.iMax} * var(--h));
     `
   : ""
  }

  ${props => (props.aspectRatio > 5/4)
   ? "width: 32%;"
   : ""
   }
`


export default class Drag extends Component {
  constructor(props) {
    super(props)

    // this.sampler = new Sampler({
    //   array: props.items
    // , sampleSize: 6
    // })

    this.dragged    = React.createRef()
    this.dropTarget = React.createRef()
    this.gameFrame  = React.createRef()

    this.state = { count: 0 }

    this.errors      = []

    this.newDeal     = this.newDeal.bind(this)
    this.startDrag   = this.startDrag.bind(this)
    this.dragStarted = this.dragStarted.bind(this)
    this.dragName    = this.dragName.bind(this)
    this.dropName    = this.dropName.bind(this)

    // this.eventType   "mousedown" | "touchstart" for setTrackedEvent
    // this.touch       prevents mouse events if action is touch
    // this.dragId      id of dragged <p> element
    // this.offset      offset from pointer to topleft of dragged item
    // this.cancel      data to end setTrackedEvent
    //                  { actions: {
    //                      move: "mousemove"
    //                    , end: "mouseup"
    //                    }
    //                  , drag: this.dragName
    //                  , drop: this.dropName
    //                  }
    // this.lastLocation { x: clientX, y: clientY }

    this.newDeal(true) // sets this.props.page.data
  }


  newDeal(startUp) {
    if (startUp === true) {
      if (!this.props.isMaster) {
        // Only allow the master to start the activity.
        return

      } else {
        // HACK: See notes at componentDidMount
        this.state = { startUp }
      }
    }

    const items        = this.items = this.props.queue.splice(0, 6)

    this.phrase_ids    = items.map( item => item._id )
    const data         = this.getLayout(items)
    const group_id     = this.props.group_id
    this.errors.length = 0

    // console.log("Drag newDeal viewData:", data)

    setViewData.call({
      group_id
    , data
    })

    // console.log("newDeal data:", JSON.stringify(data, null, "  "))

    if (startUp === true) {
      return
    }
  }


  setFluency() {
    const options = {
      group_id: this.props.group_id
    , complete: true
    }
    toggleComplete.call(options)

    const time = this.props.data.time
    const correct = this.phrase_ids.reduce((correct, id) => {
      correct[id] = !this.errors.includes(id)

      return correct
    }, {})

    this.props.treatResult(correct, time)
  }


  getLayout(items) {
    let images = shuffle(items.slice(0))
    const time = images.reduce((time, item) => {
      const next_seen = item.next_seen
      if (time < next_seen) {
        return next_seen
      } else {
        return time
      }
    }, 0)
    const dropIds  = images.map(item => item._id)

    const dragIds  = items.map(item => item._id)
    const names    = items.map(item => item.phrase)
    const keys     = names.map(name => this.hyphenate(name))

    const hints    = images.map(item => item.phrase)
    images         = images.map(item => item.image)
    const show     = [false, false, false, false, false, false]
    const complete = false

    return {
      names
    , keys
    , images
    , hints
    , show
    , dragIds
    , dropIds
    , time
    , complete
    }
  }


  startDrag(event) {
    if (this.complete) {
      return

    } else {
      const pilot = this.props.data.pilot
      const logged_in = this.props.logged_in
      if ( pilot && logged_in.includes(pilot) ) {
        return console.log("Can't start dragging")
      }
    }

    const target = event.target
    if (target.tagName !== "P") {
      return

    } else if (target.classList.contains("dropped")) {
      return
    }

    switch (event.type) {
      case "touchstart":
        this.touch = + new Date()
      break
      case "mousedown":
        if ((+ new Date() - this.touch) < 100) {
          return
        }
    }

    this.eventType = event.type
    this.drag_id   = target.id

    // Store the absolute mouse position at the start of the drag
    this.lastLocation = getXY(event, "client")

    // Find the starting position of the dragged element, in the
    // client frame of reference
    let { x, y } = target.getBoundingClientRect()

    // Remember the offset of the top-left, relative to the pointer.
    // Just add the current pointer position to get the element
    // position
    this.offset = {
      x: x - this.lastLocation.x
    , y: y - this.lastLocation.y
    }

    // Share the top left corner of the dragged element relative to
    // the gameFrame, as a ratio of width and height

    const dragData = {
      drag_id:  target.id
    , group_id: this.props.group_id
    , pilot:    this.props.d_code
    , x
    , y
    }
    this.mapToGameFrame(dragData)

    setDragTarget.call(dragData, this.dragStarted)
  }


  getFrameRect() {
    const gameFrame = this.gameFrame.current
    return gameFrame.getBoundingClientRect()
  }


  mapToGameFrame(dragData) {
    const frameRect = this.getFrameRect()
    const { top, left, width, height } = frameRect
    dragData.x = (dragData.x - left) / width
    dragData.y = (dragData.y - top) / height
  }


  dragStarted(error, data) {
    if (error) {
      return console.log("dragStarted", error)
    } else if (!data) {
      return console.log("drag not started")
    }

    this.cancel = setTrackedEvents({
      event: {
        type: this.eventType
      }
    , drag: this.dragName
    , drop: this.dropName
    })
  }


  dragName(event) {
    this.lastLocation = getXY(event)

    const dragData    = {
      x: this.lastLocation.x + this.offset.x
    , y: this.lastLocation.y + this.offset.y
    , group_id:Session.get("group_id")
    , pilot:Session.get("d_code")
    }
    this.mapToGameFrame(dragData)

    const result = updateDragTarget.call(dragData)
  }


  dropName(event) {
    // Tell all users that the dragged element was dropped, regardless
    // of where this happened
    const result = dropDragTarget.call({
      group_id: Session.get("group_id")
    })

    setTrackedEvents(this.cancel)

    const elements = document.elementsFromPoint(
      this.lastLocation.x
    , this.lastLocation.y
    )
    if (elements.length < 3) {
      return
    }

    const onTarget = !(elements.indexOf(this.dropTarget.current)<0)

    if (onTarget) {
      // Now we can tell all users that the text was well placed
      const index = this.props.data.dropIds.indexOf(this.drag_id)
      const showData = {
        group_id: Session.get("group_id")
      , index
      }

      toggleShow.call(showData)

    } else {
      const dropId = this.getDropId(elements)
      if (dropId) {
        // The name was dropped on a frame, not in a random place
        // NOTE: The same id may be added more than once.
        this.errors.push(dropId, this.drag_id)
      }
    }
  }


  getDropId(elements) {
    let dropId

    elements.every( element => {
      const id = element.id
      if (id && id.startsWith("drop-")) {
        dropId = id.substring(5)
        return false
      }

      return true
    })

    return dropId
  }


  hyphenate(expression) {
    return expression.replace(/ /g, "-")
  }


  getFrames(data, aspectRatio) {
    const frames = this.getLooseFrames(data, aspectRatio)
    const columns = this.getColumns(frames, aspectRatio)

    return <StyledFrameSet
      className="frame-set"
      aspectRatio={aspectRatio}
    >
      {columns}
    </StyledFrameSet>
  }


  getLooseFrames(data, aspectRatio) {
    const { images, hints, show, dropIds } = data

    const frames   = images.map((src, index) => {
      const hint   = hints[index]
      const showIt = show[index]
      const id     = dropIds[index] // used for class (ids = unique)

      const ref = id === this.drag_id // this.state.dropClass
                ? this.dropTarget
                : null

      return <StyledFrame
        key={"frame-"+index}
        id={"drop-"+id}
        ref={ref}
        aspectRatio={aspectRatio}
      >
        <StyledSquare
          key="item"
          src={src}
          aspectRatio={aspectRatio}
        />
        <StyledName
          className="can-select"
          show={showIt}
          key="hint"
          aspectRatio={aspectRatio}
        >
          {hint}
        </StyledName>
      </StyledFrame>
    })

    return frames
  }


  getColumns(frames, aspectRatio) {
    const columns = []
    const total = frames.length

    const rows = (this.props.aspectRatio > R)
               ? 2
               : 3
    for ( let ii = 0; ii < total; ii += rows ) {
      columns.push(
        <StyledColumn
          aspectRatio={aspectRatio}
          key={ii}
        >
          {frames.slice(ii, ii + rows)}
        </StyledColumn>
      )
    }

    return columns
  }


  getNames(data, aspectRatio) {
    const { names, keys, show, dragIds } = data
    const nameElements = names.map((name, index) => {
      const id = dragIds[index] // keys[index]

      if (data.drag_id === id) {
        return this.draggedName(name, index, aspectRatio, data)
      }

      const id_index = data.dropIds.indexOf(id)
      const className = show[id_index]
                      ? "dropped"
                      : ""
      return <div
        key={id}
      >
        <StyledDraggable
          id={id}
          className={className}
          aspectRatio={aspectRatio}
        >
          {name}
        </StyledDraggable>
      </div>
    })

    return nameElements
  }


  draggedName(name, index, aspectRatio, data) {
    let { pilot, drag_id } = data
    const target = document.getElementById(drag_id)
    const frameRect = this.getFrameRect()
    const { top, left, width, height } = frameRect

    // Use position created on the last mouse|touch move by the pilot
    let { x, y } = data
    x = x * width + left
    y = y * height + top

    return (
      <div
        key={index+"-"+name}
      >
        <StyledDragged
          id={drag_id}
          className="drag"
          aspectRatio={aspectRatio}
          x={x + "px"}
          y={y + "px"}
          ref={this.dragged}
        >
          {name}
        </StyledDragged>
      </div>
    )
  }


  turnComplete(data) {
    let completed = 0

    if (typeof data === "object") {
      const show = data.show

      if (typeof show === "object") {
        const keys = Object.keys(show)
        completed = keys.reduce(
          (counter, key) => counter + show[key]
        , completed)
      }
    }

    return (completed === 6)
           // ? + new Date()
           // : 0
  }


  render() {
    //console.log("Drag.props:",JSON.stringify(this.props,null, "  "))
    const data = this.props.data
    /* undefined or {
     *   names
     * , keys
     * , images
     * , hints
     * , show
     * , dragIds
     * , dropIds
     * }
     */

    if ( !this.gameFrame.current
      || !data
      ) {

      // The Drag class has only just been instanciated, and
      // setViewData has only just been called. On the next refresh,
      // data will have a value. In the meantime, force the gameFrame
      // ref to become something

      // console.log( "Drag no data ("
      //            + !data
      //            + ") or no gameFrame ("
      //            + !this.gameFrame.current
      //            + ")"
      //            )

      return <StyledContainer
        id="empty-drag-frame"
        ref={this.gameFrame}
      />
    }

    // console.log("Drag showing game data:", data)

    this.complete     = data.complete || this.turnComplete(data)

    const aspectRatio = this.props.aspectRatio
    const frames      = this.getFrames(data, aspectRatio)
    const names       = this.getNames(data, aspectRatio)
    // const newGame     = this.newGame(aspectRatio)

    if (this.props.isMaster && this.complete && !data.complete) {
      this.setFluency()
    }

    return (
      <StyledContainer
        id="game-layout"
        aspectRatio={aspectRatio}
        ref={this.gameFrame}
      >
        {frames}
        <StyledNames
          onMouseDown={this.startDrag}
          onTouchStart={this.startDrag}
          aspectRatio={aspectRatio}
        >
          {names}
        </StyledNames>
      </StyledContainer>
    )
  }


  componentDidMount() {
    // HACK
    // For non-masters, this.gameFrame.current will be undefined on
    // the first render, but this.props.data will already be
    // populated.
    //
    // For the master on the other hand, this.props.data initially
    // not exist, then it will be created by the call to newDeal()
    // from the constructor, On the first render this.props.data will
    // not exist, but a moment later it will. This change will cause
    // a re-render.
    //
    // For non-masters, therefore, we have to trigger a second render
    // artificially. We set this.state.startUp to true in newDeal()
    // instead of creating this.props.data, and then set it to false
    // immediately after the first render.

    this.setState({ startUp: false })
  }
}