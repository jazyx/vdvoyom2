/**
 * /public/activities/Cloze/deck/core.jsx
 *
 * The Cloze class uses componentDidUpdate() to synchronize new
 * phrases. This seems to run into a React bug that is described
 * here:
 *
 *   https://github.com/facebook/react/issues/13424
 *
 * To work around it, we temporarily show the answer in the Input
 * field, and then immediately remove it. Search for "hack" below
 * for details.
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import FluencyCore from '../../shared/fluencyCore'
import { clozeDelta } from './clozeDelta'
import { clozeComponent } from './clozeComponent'

import { setPageData } from '/imports/api/methods/admin'
import { updateInput } from '../methods'

import { Clozed } from './inputs'
import LSS from './lss'

import { NO_AUDIO_DELAY } from '/imports/tools/custom/constants'



export default class Cloze extends FluencyCore {
  constructor(props) {
    const options = {
      collection: "Cloze"
    }
    super(props, options)

    /// <<< HARD-CODED
    this.maxExtraChars = 2
    this.revealDelay   = 2000 // milliseconds
    /// HARD-CODED >>>

    this.newPhrase    = this.newPhrase.bind(this)
    this.checkSize    = this.checkSize.bind(this)
    this.updateInput  = this.updateInput.bind(this)
    this.refreshInput = this.refreshInput.bind(this) // ???
    this.setMode      = this.setMode.bind(this)      // ???
    this.submit       = this.submit.bind(this)
    this.revealAnswer = this.revealAnswer.bind(this)

    this.inputRef = React.createRef()

    // regex will match the first group of words that are linked
    // together with%percentage#or#hash symbols. Leading and trailing
    // symbols will be included in the match. Both # and % are
    // included because at least one is likely to be available on the
    // keyboard, even for Cyrillic, Thai and Arabic.
    //   TODO: Add other characters to the [%#] set for any keyboards
    //   that do not have them. Choose characters that are not
    //   used in any standard writing. Make the change also to
    //   [%#\s] in treatPhrase.
    // Subsequent such symbols will be silently ignored and removed
    // or replaced by spaces. If no such symbols are present, the
    // final .* will ensure there is a match for the full string.

    this.regex  =
      /(.*?)((?:\w+(?=[%#]))?(?:[%#](?:[^\s,;:.?!]*))+)(.*)|.*/

    this.zeroWidthSpace = "​" // "&#x200b;"
    this.revealTimeout  = 0
    this.lastIndexDelay = 1000

    this.input          = ""
    this.state          = {
      start:    ""
    , expected: ""
    , cloze:    ""
    , end:      ""
    , maxLength: 0
    , minWidth:  0
    , width:     0
    , error:     false
    , correct:   false
    , reveal:    false
    , fix:       false
    }
  }


  /** Called by render and chooseNextActivity (componentDidMount)
   *
   * @return     {<type>}  { description_of_the_return_value }
   */
  newPhrase() {
    if (!this.props.isMaster) {
      return
    }

    let data = this.props.queue[0]
    // console.log(JSON.stringify(data, null, "  "))
    // { "collection": "Cloze",
    //   "flops": 4,
    //   "next_seen": 1596423707537,                  <<<
    //   "phrase_id": "r3NnA8jSkQ3QhCRhT",
    //   "times_seen": 0,
    //   "_id": "r3NnA8jSkQ3QhCRhT",                  <<<
    //   "phrase": "Сейчас три %часа",                <<<
    //   "native": "It's three o'%clock",             <<<
    //   "image": "/Assets/shared/images/clock.jpg",  <<<
    //   "audio": "/Assets/shared/audio/ru/clock.mp3" <<<
    // }

    if (!data) {
      return
    }

    this.error = false
    const group_id = this.props.group_id
    const {
      _id
    , next_seen: time
    , phrase
    , native
    , image
    , audio
    } = data
    data = { _id, time, phrase, native, image, audio  }

    // React Hack: we must momentarily show (any) text, to make the
    // input respond to onChange. We will remove the text in the
    // setSize ref callback.
    data.input = data.phrase

    data.requireSubmit = true // false // / TODO: Allow options
    data.reveal        = false
    data.revealed      = false

    setPageData.call({ group_id, data })
  }


  treatPhrase(phrase) {
    const match  = this.regex.exec(phrase)

    let start = match[1]
    if (start) {
      start = start.trim() + " "
    } else {
      start = ""
    }

    let cloze = match[2]
    if (cloze) {
      cloze = cloze.replace(/[%#\s]+/g, " ") // << nbsp
                   .trim() || " "
    } else { // There are no #% symbols. Use the entire string.
      cloze = match[0].trim()
    }

    const end = (match[3] || "").replace(/[%#\s]+/g, " ").trimRight()
    const data = {
      phrase
    , expected: cloze
    , start
    , cloze
    , end
    , fromNewPhrase: true
    , width: 0
    // , requireSubmit: true // false // true //
    , submitted: false
    , cue: "none" // "placeholder" // "backdrop"
    }

    this.setState(data)

    // Don't call treatPhrase again until the phrase changes
    this.phrase = phrase
  }


  updateInput(event) {
    if (this.state.correct && event.preventDefault) {
      // Don't allow input after the correct answer has been entered.
      // Do let setSize set the input value to "" after fixing the
      // width of the input field.

      event.preventDefault()
      return false
    }

    const field     = event.target
    const input     = field.value.replace(this.zeroWidthSpace, "")
    const selection = field.selectionStart

    const reveal    = false // hide feedback cue when user types
    const group_id  = this.props.group_id

    const update    = { group_id, input, selection, reveal }
    updateInput.call(update)

    if (this.props.data.revealed) {
      // Prepare to show feedback cue again after a pause in typing
      this.rescheduleReveal()
    }
  }


  rescheduleReveal() {
    clearTimeout(this.revealTimeout)

    this.revealTimeout = setTimeout(
      () => this.revealAnswer("noAudio"), this.revealDelay
    )
  }


  /*  Prepares to display the `right` answer on the next render in
   *  front of the input field. Any further input will make it fade.
   *  
   *  May be called:
   *  • When a phrase is first displayed
   *  • When the user presses the Reveal button
   *    > In Submit mode:
   *      - While input field is empty, in Submit mode:
   *      - After an error in submission
   *      - After a pause in input after an error in submission
   *    
   *    > In autoComplete mode
   *      - At any time
   *
   *  @param  {Boolean  noAudio  Will be true if:
   *                             * shown when image is displayed (the
   *                               entire phrase will be played)
   *                             * called after a pause in input
   */
  revealAnswer(noAudio) {
    if (!!noAudio) {
      // TODO: Play audio for missing word
    }

    setPageData.call({
      group_id: this.props.group_id
    , data: {
        reveal: true
      , revealed: true
      }
    })
    clearTimeout(this.revealTimeout)
  }


  refreshInput() { // ???
    this.treatInput(this.state.input)
  }


  treatInput(wrote) {
    const right = this.state.expected
    const requireSubmit = this.props.data.requireSubmit
    const delta = clozeDelta( right, wrote, requireSubmit )
    /* { chunkArray: [ array of strings, some empty ]
     * , transform:  [ array of 0s and string actions ]
     * , correct:    <true if complete text correctly entered>
     * , error:      <false if everything typed so far is correct>
     * }
     */
    // console.log("treatInput     ", wrote, "(", right, ")")
    // console.log("chunkArray:    ", delta.chunkArray)
    // console.log("transform:     ", delta.transform)
    // console.log("error:         ", delta.error, "correct:", delta.correct)
    // console.log()

    const cloze = clozeComponent(delta) // chunkArray and transform

    delta.cloze         = cloze
    delta.requireSubmit = requireSubmit
    delta.maxLength     = right.length + this.maxExtraChars

    // reveal is true if the RevealAnswer button was pressed
    // * Before any further input
    // * After a pause
    delta.reveal        = this.props.data.reveal

    //
    delta.fix           = (requireSubmit&&delta.error) || delta.reveal

    // this.state.submitted is set to true by
    // * setFluency, which is called if !requireSubmit when the
    //   input is correct
    // * A click on the Submit button
    delta.show          = ( !requireSubmit
                          || this.state.submitted
                          )
                        ? "show"
                        : ""

    // console.log("requireSubmit: ", delta.requireSubmit)
    // console.log("reveal:        ", delta.reveal)
    // console.log("fix:           ", delta.fix)
    // console.log("")
    this.setState(delta)

    this.input = wrote
    this.error = this.error || delta.error
  }


  prepareToSubmit(input) { // ???
    this.setState({
      cloze: input || this.zeroWidthSpace
    , error: false
    , correct: false
    })
  }


  /**
   * checkSize is called a first time as the `ref` of the
   * WidthHolder component. For this first call, the `span`
   * argument will contain the actual DOM element, so we capture that
   * and store it in `this.span`, because we won't get a second
   * chance.
   *
   * Subsequent calls are sent from WidthHolder's componentDidUpdate
   * method, which has no direct access to the DOM element itself, so
   * we need to use the stored `this.span`
   *
   * We need to check that either the width or the current value of
   * `this.input`, because if we reset this.state.width or
   * this.state.input to their current values, React will trigger a
   * new render, endlessly.
   */
  checkSize(span){
    if (span && !this.span) {
      this.span = span
      this.inputRef.current.focus()
    }
    this.setSize()
  }


  setSize() {
    const width = this.span.getBoundingClientRect().width + 1

    if (this.state.width !== width){
      if (this.state.fromNewPhrase) {
        this.setState({
          width
        , minWidth: width
        , cloze: this.zeroWidthSpace
        , fromNewPhrase: false
        })
        // React Hack. In newPhrase, we had to add (some) text to the
        // input field, otherwise it would not show any user input and
        // would not therefore not trigger its onChange method.
        this.updateInput({
          target: {
            value: ""
          , selectionStart: 0
          }
        })

      } else {
        this.setState({ width })
      }
    }
  }


  setMode() { // ???
    // const requireSubmit = !this.state.requireSubmit
    // this.setState({ requireSubmit })

    // if (requireSubmit) {
    //   this.setState({ cloze: this.state.input || this.zeroWidthSpace })
    // } else {
    //   setTimeout(this.refreshInput, 0)
    // }

    // this.inputRef.current.focus()
  }


  submit() { // ???
    this.refreshInput()
    this.setState({ input: "" })
  }


  setFluency() {
    const data = this.props.data
    const time = data.time
    const correct = { [data._id]: !this.error }

    const treatResult = this.props.treatResult || this.treatResult
    treatResult(correct, time)
    this.setState({ submitted: true })
  }


  /** Called by FluencyCore.treatResult, itself called by setFluency
   *  during a componentDidUpdate event
   */
  chooseNextActivity() {
    setTimeout(() => {
      this.setState({ correct: false })
      this.phrase = ""
      this.newPhrase()
    }, NO_AUDIO_DELAY)
  }


  render() {
    // console.log(JSON.stringify(this.props, null, "  "))
    console.log(JSON.stringify(this.state, null, "  "))
    const newItems = this.props.isMaster
                   ? this.checkForNewItems() // in FluencyCore
                   : false
    if (newItems) {
      return "Loading new items"

    } else if (!this.props.data) {
      // The first time render is called, the constructor calls
      // setPageData to set the Groups page.date. This will be
      // available on the next render, which will occur when the
      // new value of the Groups.page.data is available.

      this.newPhrase()
      return "Preparing first item"
    }

    const { image, input, reveal } = this.props.data

    return (
      <Clozed
        src={image}
        input={input}
        phrase={this.state}
        reveal={reveal}

        size={this.checkSize}
        change={this.updateInput}
        submit={this.submit}
        revealAnswer={this.revealAnswer}

        inputRef={this.inputRef}
        aspectRatio={this.props.aspectRatio}
      />
    )
  }


  componentDidUpdate() {
    if (this.state.correct && !this.state.submitted) {
      this.setFluency()

    } else {
      const data = this.props.data

      if (data) {
        const { image, phrase, input, selection } = data

        if (this.phrase !== phrase) {
          this.treatPhrase(phrase)

        } else if (this.input!==input && !this.state.fromNewPhrase) {
          this.treatInput(input)
          this.inputRef.current.setSelectionRange(selection,selection)
          this.inputRef.current.focus()
        }
      }
    }
  }
}