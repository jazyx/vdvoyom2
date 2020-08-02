/**
 * /public/Activities/Cloze/deck/styles.js
 */



import styled from 'styled-components'

const fontSize = "6vmin"
const fontFamily = "'DejaVu serif', Cambria, serif"
const colors = {
  normal:           "#000"
, normalBG:         "#ddf"
, errorBG:          "#fee"
, correctBG:        "#dfd"
, spaceHighlight:   "rgba(192,192,192, 0.5)"
, normalOutline:    "#99c"
, errorOutline:     "#966"
, correctOutline:   "#696"
, normalHighlight:  "#ccf"
, errorHighlight:   "#fcc"
, correctHighlight: "#9c9"
, correctOutline:   "#9c9"
, buttonOff:        "#777"
, buttonOn:         "#555"
, add:              "#f00"
, cut:              "#f00"
, fix:              "#90f"
, flip:             "#f60"
}


const short  = 10/13
const snug   = 10/11
const square = 1
const wide   = 17/10


export const StyledContainer = styled.div`
  width: calc(100 * var(--w));
  height: calc(100 * var(--h));
  display: grid;
  grid-template-columns: repeat(10, calc(10 * var(--w)));
  grid-template-rows: repeat(12, calc(10 * var(--w))) 1fr calc(10 * var(--w));

  ${props => (props.aspectRatio > short)
    ? `grid-template-columns: repeat(10, calc(9 * var(--w))) calc(10 * var(--w));
       grid-template-rows: repeat(10, calc(9 * var(--w))) 1fr calc(20 * var(--w));
      `
    : ""
   }

  ${props => (props.aspectRatio > snug)
    ? `grid-template-columns: 1fr repeat(8, calc(10 * var(--w))) 1fr;
       grid-template-rows: repeat(8, calc(10 * var(--w))) 1fr calc(20 * var(--w));
      `
    : ""
   }

  ${props => (props.aspectRatio > square)
    ? `grid-template-columns: 1fr repeat(10, calc(8 * var(--h))) 1fr;
       grid-template-rows: repeat(10, calc(8 * var(--h))) 1fr calc(20 * var(--h));
      `
    : ""
   }

  ${props => (props.aspectRatio > wide)
    ? `grid-template-columns: repeat(10, calc(10 * var(--h))) 1fr 1fr 1fr;
       grid-template-rows: repeat(10, calc(10 * var(--h)));
      `
    : ""
   }
`


export const StyledImage = styled.img`
  background-color: #300;
  grid-column: 1/11;
  grid-row: 1/11;
  object-fit: contain;
  width: 100%;
  height: 100%;

  ${props => (props.aspectRatio > snug)
    ? `grid-column: 2/10;
       grid-row: 1/9;
      `
    : ""
   }

  ${props => (props.aspectRatio > square)
    ? `grid-column: 2/12;
       grid-row: 1/11;
      `
    : ""
   }

  ${props => (props.aspectRatio > wide)
    ? `grid-column: 1/11;
       grid-row: 1/11;
      `
    : ""
   }
`


export const StyledEntry = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  grid-column: 1/11;
  grid-row: 11/13;
  font-size: calc(5.5 * var(--min));

  ${props => (props.aspectRatio > short)
    ? `grid-column: 1/12;
       grid-row: 12;
       font-size: calc(5 * var(--min));
      `
    : ""
   }

  ${props => (props.aspectRatio > snug)
    ? `grid-column: 1/11;
       grid-row: 10;
       font-size: calc(4.75 * var(--min));
      `
    : ""
   }

  ${props => (props.aspectRatio > square)
    ? `grid-column: 1/13;
       grid-row: 12;
       font-size: calc(4.2 * var(--w));
      `
    : ""
   }

  ${props => (props.aspectRatio > wide)
    ? `grid-column: 11/14;
       grid-row: 3/11;
      `
    : ""
   }
`


export const StyledPhrase = styled.p`
  font-family: ${fontFamily};
  text-align: center;

  box-sizing: border-box;
  padding: 0 0.5em;
  width: calc(100 * var(--w) - 20 * var(--min));
  margin: 0;
`


export const StyledInputSpan = styled.span`
  display: inline-block;
  position: relative;
  vertical-align: top;
  min-width: ${props => props.minWidth}px;
  width: ${props => props.width}px;
`


// The text input element will expand to fill its parent div, which
// will in turn expand to fit the width of the expected span (at a
// minimum), or the Feedback span (whichever is greater).
export const StyledInput = styled.input.attrs(props => {
  return {
    type: "text"
  }
})`
  font-family: ${fontFamily};
  position: absolute;
  top: 0;
  left: 0;
  height: 1.2em;
  color: ${colors.normal};

  width: 100%;

  margin: 0;
  padding: 0;
  border: none;

  background-color: ${props => props.error
                             ? colors.errorBG
                             : props.correct
                               ? colors.correctBG
                               : colors.normalBG
                     };

  outline-color: ${props => props.error
                             ? colors.errorOutline
                             : props.correct
                               ? colors.correctOutline
                               : colors.normalOutline
                     };

  &::selection {
    background-color: ${props => props.error
                               ? colors.errorHighlight
                               : props.correct
                                 ? colors.correctHighlight
                                 : colors.normalHighlight
                       };
  }

  &:disabled{
    outline: ${colors.correctOutline} auto 1px;
  }

  font-size: calc(5.5 * var(--min));

  ${props => (props.aspectRatio > short)
    ? `font-size: calc(5 * var(--min));
      `
    : ""
   }

  ${props => (props.aspectRatio > snug)
    ? `font-size: calc(4.75 * var(--min));
      `
    : ""
   }

  ${props => (props.aspectRatio > square)
    ? `font-size: calc(4.2 * var(--w));
      `
    : ""
   }
`

// The feedback span will show the same text as the input element,
// but divided into different spans according to the error type
// of a particular group of letters.
export const StyledFeedback = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  white-space: pre;
  color: ${colors.normal};

  ${props => props.fix
           ? "opacity: 0.325;"
           : ""
   }

  /* Let input element behind show its cursor and receive mouse and
   * touch events
   */
  background: transparent;
  pointer-events: none;

  & span {
    ${props => props.reveal
             ? `color: ${colors.normal};`
             : ""
     }
  }
`

// A zero-width span with no text, to show where one or more letters
// are missing. It appears as: |
//                             ^
export const StyledAdd = styled.span`
  display:inline-block;
  height:0.7em;
  box-shadow:0px 0 0 1px ${colors.add};
  position:relative;
  ${props => props.has_space
           ? `background-color: ${colors.spaceHighlight};`
           : ""
   }

  &:after {
    content: "^";
    position: absolute;
    top: 92%;
    left: 50%;
    transform: translate(-50%);
    color: ${colors.add};
    font-size: 0.25em;
  }
`

// Cut, Fix and Flip show respectively groups of letters which are
// not needed, not the right characters, or a pair of characters in
// the wrong order.
export const StyledCut = styled.span`
  display:inline-block;
  color: ${colors.cut};
  ${props => props.has_space
           ? `background-color: ${colors.spaceHighlight};`
           : ""
   }
`


export const StyledFix = styled.span`
  display:inline-block;
  color: ${colors.fix};
  ${props => props.has_space
           ? `background-color: ${colors.spaceHighlight};`
           : ""
   }
`


export const StyledFlip = styled.span`
  display:inline-block;
  color: ${colors.flip};
  ${props => props.has_space
           ? `background-color: ${colors.spaceHighlight};`
           : ""
   }
`


export const StyledSubmit = styled.button`
  display: ${props => props.visible
                    ? "inline-block;"
                    : "none;"
            }
  background-color: ${props => colors.buttonOff};
  background-image: url(${props => props.img});

  position: absolute;
  right: 0;
  bottom: 0;
  width: calc(15 * var(--min));
  height: calc(15 * var(--min));
  border: calc(0.5 * var(--min)) outset #999;
  border-radius: calc(10 * var(--min));

  &:active {
    background-color: ${props => colors.buttonOn};
    border: calc(0.7 * var(--min)) inset ${props => colors.buttonOff};
  }
`


export const StyledButtonSet = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: flex-end;
  grid-column: 1/11;
  grid-row: 14;

  & button {
    width: calc(10 * var(--min));
    height: calc(10 * var(--min));
    box-sizing: border-box;
    border: calc(0.5 * var(--min)) outset #999;
    border-radius: calc(10 * var(--min));
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    background-color: ${props => colors.buttonOff};

    &:active {
      background-color: ${props => colors.buttonOn};
      border: calc(0.7 * var(--min)) inset ${props => colors.buttonOff};
    }
  }

  ${props => (props.aspectRatio > short)
    ? `flex-direction: column;
       grid-column: 11;
       grid-row: 1/11;
      `
    : ""
   }

  ${props => (props.aspectRatio > snug)
    ? `grid-column: 10;
       grid-row: 1/9;

       & button.solo {
         position: fixed;
         left: 0;
       }
      `
    : ""
   }

  ${props => (props.aspectRatio > square)
    ? `grid-column: 12;
       grid-row: 1/11;
      `
    : ""
   }

  ${props => (props.aspectRatio > wide)
    ? `flex-direction: row;
       grid-column: 11/14;
       grid-row: 1/3;

       & button {
         width: calc(20 * var(--h));
         height: calc(20 * var(--h));
       }

       & button.solo {
         position: relative;
       }
      `
    : ""
   }
`


export const StyledButton = styled.button`
  display: ${props => props.visible
                    ? "inline-block;"
                    : "none;"
            }
  background-image: url(${props => props.img});
`


export const StyledToggleButton = styled.button`
  display: ${props => props.visible
                    ? "inline-block;"
                    : "none;"
            }
  background-image: url(${props => props.img});
  background-color: ${props => props.on === "true"
                             ? colors.buttonOn
                             : colors.buttonOff
                     };
`