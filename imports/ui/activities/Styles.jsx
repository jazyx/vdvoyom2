/**
 * import/ui/activities/Styles.jsx
 *
 */

import styled, { css } from 'styled-components'
import { tweenColor } from '../../tools/generic/utilities'

const colors = {
  background: "#010"
}
colors.active = tweenColor(colors.background, "#fff", 0.1)


export const StyledProfile = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: calc(100 * var(--h));
  background-color: ${colors.background};
  background-color: ${props => (props.aspectRatio > 1)
                             ? "#100;"
                             : "#000800;"
                     };
`

// StyledPrompt:      10vmin + 5vmin margin => 15
// StyledChoices:     50vmin
// StyledDescription: 18vmin + 2vmin margin => 20
// StyledButton:      15vmin                => 15
export const StyledPrompt = styled.h1`
  display: flex;
  align-items: center;
  text-align: center;
  height: calc(10 * var(--min));
  font-size: calc(8 * var(--min));
  margin: calc(2.5 * var(--min))
          0
          calc(2.5 * var(--min));
`

export const StyledChoices = styled.ul`
  list-style-type: none;
  width: calc(100 * var(--w));
  height: calc(100 * var(--h) - 50 * var(--min));
  margin: 0;
  padding: 0;
  text-align: center;
  overflow-y: auto;

  ${props => (props.aspectRatio > 1)
           ? `white-space: nowrap;
             `
           : ""
  }
`

export const StyledDescription = styled.p`
  height: calc(18 * var(--min));
  width: 100%;
  margin: 0;
  font-size: calc(3.75 * var(--min));
  box-sizing: border-box;
  padding: 0.25em;
  margin: 0 0 calc(2 * var(--min));
  overflow-y: auto;
`

export const StyledChoice = styled.li`
  position: relative;
  width: calc(50 * var(--w) - 10px);
  height: calc(50 * var(--w) - 10px);

  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  cursor: pointer;
  ${props => props.disabled
           ? `opacity: 0.1333;
              pointer-events: none;
              cursor: default;
             `
           : props.selected
             ? `opacity: 1;`
             : `opacity: 0.6667;`
   }
  & p {
    position: absolute;
    background: rgba(0,0,0,0.25);
    top: 0;
    left: 0;
    width: 100%;
    font-size: calc(5 * var(--min));
    text-align: center;
    margin: 0;
  }

  ${props => (props.aspectRatio > 1)
           ? ""
           : `float: left;`
  }

  ${props => (props.aspectRatio > 1)
           ? `width: calc(50 * var(--h) - 20px);
              height: calc(50 * var(--h) - 20px);
              display: inline-block;
              clear: both;
             `
           : ""
   }
`

export const StyledButton = styled.button`
  background: transparent;
  border-radius: 10vh;
  padding: 0.1em 1em;
  color: #fff;
  height: calc(15 * var(--min));
  width: calc(70 * var(--min));
  font-size: calc(5.25 * var(--min));
  ${props => props.disabled
           ? `opacity: 0.25;
              pointer-events: none;
             `
           : `cursor: pointer;`
   }

  &:active {
    background: ${colors.active};
  }
`
