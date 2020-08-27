/**
 * /public/activities/Show/deck/styles.jsx
 * 
 * See /client/main.css for :root definition of colors and padding
 */



import styled from 'styled-components'



export const StyledContainer = styled.div`
  width: calc(100 * var(--w));
  height: calc(100 * var(--h));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: calc(3.5 * var(--min));

  ${props => {
    let rules = ""

    const tweak = props.tweak
    if (typeof tweak === "object") {
      const keys = Object.keys(tweak)
      keys.forEach( key => {
        let value = tweak[key]
        if (value.substr(-1) !== ";") {
          value += ";"
        }

        if (key.startsWith("&")) {
          rules += key.replace("•", ".") + " " + value
        } else {
          rules += key + ": " + value
        }
      })
    }

    return rules
  }}
`


export const StyledMenuContainer = styled.div` 
  position: absolute;
  top: 0;
  left: 0;
  height: calc(100 * var(--h));
  z-index: 1;
`


export const StyledSVG = styled.svg`
  position: absolute;
  width: calc(15 * var(--min));
  height: calc(15 * var(--min));
  fill: var(--fillColor);
  stroke: var(--strokeColor);
  opacity: ${props => (
    props.open ? 1 : (props.over ? 0.75 : 0.25)
  )};
  bottom: 0;
  left: ${props => props.open
                 ? "calc(45 * var(--min));"
                 : 0};
  z-index: 2;
  transition: left .3s linear, opacity .1s;
  transition-property: left, opacity;
  transition-delay: ${props => props.open ? ".1s, 0s;" :"0s, .3s;"}
`


export const StyledShowMenu = styled.div`
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
  /* padding: calc(2 * var(--min)); */
  padding-top: calc(15 * var(--min));
  padding-bottom: 0;
  background-color: var(--menuBackground);

  transition: left .40s linear;
`


export const StyledShowList = styled.ul`
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
`


export const StyledShowItem = styled.li`
  padding: var(--menuItemPadding);
  box-sizing: border-box;
  color: var(--menuColor);

  &:hover {
    background-color: var(--menuHover);
  }

  ${ props => props.active 
            ? `font-weight: bold;
               color: var(--menuActiveColor);
               background-color: var(--menuActiveBg);
              `
            : ""
  }

  & span:first-child {
    display: inline-block;
    font-size: 0.5em;
    width: 2em;
    text-align: right;
    padding: 0 0.25em 0 0;
    vertical-align: middle;
  }
`


export const StyledNotes = styled.ul`
  position: fixed;
  top: 0;
  background-color: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 5vmin;
`


export const StyledSplash = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;    
  width: calc(100 * var(--min));
  height: calc(100 * var(--min));

  & img {
    width: 100%;
  }

  & div {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0.25em;
  }

  & p {
    margin: 0;
    font-size: calc(2.25 * var(--min));
  }
`


export const StyledVideo = styled.iframe`
  min-width: 100%; 
  min-height: 100%;
  width: auto; 
  height: auto;
  ${props => {
    const { videoRatio, aspectRatio } = props
  }}
`


export const StyledMask = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  opacity: 0;
`


export const StyledButtons = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 24vw;
  height: 8vw;

  & button {
    position: absolute;

    top: 0;
    height: 8vw;

    background-size: contain;
    background-repeat: no-repeat;
    border: none;
    background-color: transparent;
  }
`


export const StyledRewind = styled.button`
  left: 0;
  width: 8vw;
  background-image: url("img/icons/rewind.png");

  &:active {
      background-image: url("img/icons/rewind_down.png");
  }
`

export const StyledPause = styled.button`
  right: 0;
  width: 16vw;
  background-image: url("img/icons/${props => props.paused
                                            ? "pause"
                                            : "play"
                                    }.png");
`


export const StyledSolo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;

  & img {
    width: 100%;
    object-fit: contain;
    max-height: calc(100 * var(--h) - 1.5em);

    ${props => props.legend
             ? ""
             : `max-height: calc(100 * var(--h));`
     }
  }

  & p {
    text-align: center;
    height: 1.5em;
    margin: 0;
    padding: 0.25em 0;
    box-sizing: border-box;
  }
`


export const StyledDuo = styled.div`
  display: flex;
  flex-direction: ${ props => props.aspectRatio > props.limit
                            ? "row"
                            : "column"
                   };
  & img {
    ${ props => props.aspectRatio > props.limit
                            ? `height: 100%;
                               width: auto;
                              `
                            : `height: auto;
                               width: 100%;
                              `
                   };
  }

`