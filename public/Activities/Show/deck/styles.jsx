/**
 * /public/activities/Show/deck/styles.jsx
 */



import styled from 'styled-components'


const SETTINGS = {
  fillColor:       "#fff"
, strokeColor:     "#000"
, menuBackground:  "rgba(255,255,255,0.9)"
, menuFontSize:    "4vmin"
, menuColor:       "#AF3632"
, menuActiveColor: "#fff"
, menuActiveBg:    "#AF3632"
, menuHover:       "rgba(175, 54, 50, 0.5)"
, menuItemPadding: "0.25em"
}



export const StyledContainer = styled.div`
  width: calc(100 * var(--w));
  height: calc(100 * var(--h));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: calc(4 * var(--w));

  ${props => {
    let rules = ""
    
    const tweak = props.tweak
    if (typeof tweak === "object") {
      const keys = Object.keys(tweak)
      keys.forEach( key => {
        rules += key + ": " + tweak[key] + ";\n"
      })
    }

    return rules
  }}
`


export const StyledSVG = styled.svg`
  position: fixed;
  width: calc(15 * var(--min));
  height: calc(15 * var(--min));
  fill: ${SETTINGS.fillColor};
  stroke: ${SETTINGS.strokeColor};
  opacity: ${props => (
    props.open ? 1 : (props.over ? 0.75 : 0.25)
  )};
  bottom: 0;
  left: ${props => props.open
                 ? "calc(45 * var(--min));"
                 : 0};
  transition: left .3s linear, opacity .1s;
  transition-property: left, opacity;
  transition-delay: ${props => props.open ? ".1s, 0s;" :"0s, .3s;"}
`


export const StyledShowMenu = styled.div`
  position: fixed;
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
  background-color: ${SETTINGS.menuBackground};

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
  padding: ${SETTINGS.menuItemPadding};
  box-sizing: border-box;
  color: ${SETTINGS.menuColor};

  &:hover {
    background-color: ${SETTINGS.menuHover};
  }

  ${ props => props.active 
            ? `font-weight: bold;
               color: ${SETTINGS.menuActiveColor};
               background-color: ${SETTINGS.menuActiveBg};
              `
            : ""
  }

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

  & a {
    color: #000;
  }
`



export const StyledSolo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  & img {
    width: 100%;
    object-fit: contain;
    max-height: calc(100 * var(--h) - 1.25em)

    ${props => props.legend
             ? ""
             : `max-height: calc(100 * var(--h));`
     }
  }

  & p {
    text-align: center;
    height: 1.5em;
    margin: 0.25em 0;
  }
`