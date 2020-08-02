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

    const { start
          , cloze
          , end
          , minWidth
          , width
          , error
          , correct
          , maxLength
          , requireSubmit // missing?
          , reveal
          , fix
          // , expected
          } = this.props.phrase
    const { src
          , input
          , size
          , change
          , inputRef
          , aspectRatio
          } = this.props

    window.change = change

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
              <StyledInput
                className="input can-select"
                error={error}
                correct={correct}
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

          <Reveal
            visible={true}
            aspectRatio={aspectRatio}
          />
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
    visible={props.visible}
    img="/img/icons/eye.svg"
  />
)


const Submit = props => (
  <StyledSubmit
    onMouseDown={props.submit}
    visible={props.visible}
    img="/img/icons/done.svg"
  />
)