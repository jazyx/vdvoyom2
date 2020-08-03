/**
 * /imports/ui/activities/Cloze/inputs.jsx
 */



import React, { Component } from 'react';
import { StyledContainer
       , StyledImage

       , StyledEntry
       , StyledPhrase
       , StyledInputSpan
       , StyledInput
       , StyledFeedback
       , StyledSubmit

       , StyledAdd
       , StyledCut
       , StyledFix
       , StyledFlip

       , StyledButtonSet
       , StyledToggleButton
       , StyledButton
       //, StyledDiv
       //, StyledTextArea
       ,
       } from './styles'



export class Clozed extends Component {
  render() {
    // console.log("Clozed", this.props)
    if (!this.props.phrase.cloze) {
      return ""
    }

    const { start         // string before input word
          , cloze         // array of span components for feedback
          , end           // string after input word

          , minWidth      // minimum pixels for complete input
          , width         // actual width of input (may be longer)
          , maxLength     // max number of input characters

          , error         // false or truthy
       // , correct       // not used?
          , requireSubmit // missing?
          , reveal        // true if correct spelling to be shown
          , cue           // TODO: "placeholder" | "backdrop" | "none"
          , fix           // true if feedback should be shown

       // USED IN ClozeCore, UNUSED HERE //
       // , chunkArray    // raw array for cloze
       // , transform     // array of transform to apply to chunkArray
       // , expected      // expected input string
       // , fromNewPhrase // true if we're setting width of input
       // , phrase        // complete phrase with #% symbols
       // , submitted     // true if requireSubmit and submit pressed
          } = this.props.phrase

    const { src           // image url
          , input         // string
          , size          // function ClozeCore.checkSize
          , change        // function ClozeCore.updateInput
          , inputRef      // React.createRef() for StyledInput
          , aspectRatio   // number from master's display
       // , phrase        // see above
          } = this.props 

    const options = { aspectRatio }
    let ActionButton

    if (requireSubmit) {
      if (cue === "none" && input === "") {
        ActionButton = <Reveal { ...options } />
      } else {
        options.disabled = input === ""
        ActionButton = <Submit { ...options } />
      }
    } else if ( cue === "placeholder" && reveal ) {
      options.disabled = input === ""
      ActionButton = <Reveal { ...options } />
    } else {
      ActionButton = ""
    }

    return (
      <StyledContainer
        id="answer"
        aspectRatio={aspectRatio}
      >
        <StyledImage
          src={src}
          aspectRatio={aspectRatio}
        />

        <StyledEntry
          aspectRatio={aspectRatio}
        >
          <StyledPhrase>
            <span>{start}</span>

            <StyledInputSpan
              id="input"
              minWidth={minWidth}
              width={width}
            >

              {/* correct={correct} */}
              <StyledInput
                className="input can-select"
                error={error}
                requireSubmit={requireSubmit}
                maxLength={maxLength}
                value={input}
                onChange={change}
                spellCheck={false}
                ref={inputRef}
                aspectRatio={aspectRatio}
              />

              <Feedback
                size={size}
                cloze={cloze}
                fix={fix}
                reveal={reveal}
              />
            </StyledInputSpan>

            <span>{end}</span>
          </StyledPhrase>

          {ActionButton}
        </StyledEntry>

        <StyledButtonSet
          id="button-set"
          aspectRatio={aspectRatio}
        >
          <Back
            className="soloist"
            visible={true}
          />
          <Audio
            visible={true}
            playing="true"
          />
          <TurnCard
            visible={true}
          />
        </StyledButtonSet>
      </StyledContainer>
    )
  }
}


class Feedback extends Component{
  render() {
    const { size, cloze, fix, reveal, aspectRatio } = this.props

    return (
      <StyledFeedback
        className="cloze"
        ref={size}
        fix={fix}
        reveal={reveal}
        aspectRatio={aspectRatio}
      >
        {cloze}
      </StyledFeedback>
    )
  }


  componentDidUpdate() {
    this.props.size()
  }
}



export const Add = () => (
  <StyledAdd />
)



export const Cut = (props) => (
  <StyledCut
    has_space={props.has_space}
  >
    {props.children}
  </StyledCut>
)



export const Fix = (props) => (
  <StyledFix
    has_space={props.has_space}
  >
    {props.children}
  </StyledFix>
)



export const Flip = (props) =>  (
  <StyledFlip
    has_space={props.has_space}
  >
    {props.children}
  </StyledFlip>
)


const Back = props => (
  <StyledButton
    onMouseDown={props.goBack}
    visible={props.visible}
    className="solo"
    img="/img/icons/back.svg"
  />
)


const Audio = props => (
  <StyledToggleButton
    onMouseDown={props.playAudio}
    visible={props.visible}
    on={props.playing}
    img={ props.playing
        ? "/img/icons/audioOn.svg"
        : "/img/icons/audio.svg"
        }
  />
)


const TurnCard = props => (
  <StyledButton
    onMouseDown={props.turnCard}
    visible={props.visible}
    img="/img/icons/turn.svg"
  />
)


const Reveal = props => (
  <StyledSubmit
    onMouseDown={props.reveal}
    img="/img/icons/eye.svg"
  />
)


const Submit = props => (
  <StyledSubmit
    onMouseDown={props.submit}
    img="/img/icons/done.svg"
  />
)