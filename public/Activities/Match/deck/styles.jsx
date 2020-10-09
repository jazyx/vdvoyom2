/**
 * /public/activities/Show/deck/styles.jsx
 *
 * See /client/main.css for :root definition of colors and padding
 */



import styled from 'styled-components'


const size =12
const tweak = 3
const rail = 16 // depends on OS?
const buttonSize = 10

const tick = "/img/icons/tick.svg"
const cross = "/img/icons/cross.svg"
const locked = "/img/icons/locked.png"
const opened = "/img/icons/opened.png"

const getListRules = (portrait, count) => {
  // The lists are always across the min sides
  const extent      = count * size
  const needsScroll = extent > 100
  const pad         = (100 - extent) / 2
  const space = needsScroll
              ? `calc(${rail}px + ${size} * var(--min )+ ${tweak}px)`
              : `calc(${size} * var(--min) + ${tweak}px)`
  // console.log("getListRules portrait:", portrait, "extent:", extent, "needsScroll:", needsScroll, "pad:", pad)

  if (portrait) {
    return `
      width: calc(100 * var(--w));
      overflow-y: auto;
      height: ${space};
      white-space: nowrap;
     `
  } else {
    const padding = needsScroll
                  ? "0"
                  : `calc(${pad} * var(--min)) 0`
    return `
      height: calc(100 * var(--h));
      overflow-x: auto;
      width: ${space};
      padding: ${padding};
     `
  }
}


const getCompareRules = (portrait, count) => {
  // The lists are always across the min sides
  const needsScroll = count * size > 100
  const gapSize = needsScroll
  ? `calc(100*var(--max) - 2*${tweak}px - 2*(${rail}px + ${size} * var(--min)))`
  : `calc(100*var(--max) - 2*${tweak}px - 2*(${size} * var(--min)))`

  let rules = (portrait)
            ? `height: ${gapSize};
               width: 100%;
              `
            : `width: ${gapSize};
               height: 100%;
              `
  rules += `position: relative;`

  return rules
}


const getFrameRules = (aspectRatio, count) => {
  let side

  const needsScroll = count * size > 100
  const { width, height } = document.body.getBoundingClientRect()
  const shortSide = Math.min(width, height) / 2
  let longSide    = Math.max(width, height) / 2
  const listSize    = tweak
                    + (needsScroll ? rail : 0)
                    + size * shortSide / 50
  longSide = Math.min(longSide - listSize, shortSide * 2)

  // console.log("frame width:", width, "height:", height)
  // console.log("needsScroll:", needsScroll, "listSize:", listSize)
  // console.log("shortSide:", shortSide, "longSide:", longSide)

  if (longSide > shortSide) {
    side = longSide + "px"
  } else {
    side = shortSide + "px"
  }

  return `
    position: absolute;
    width: ${side};
    height: ${side};
    top: 0;
    left: 0;
  `
}


const getThumbnailBorder = (selected, paired) => {
  let rules = "border-style: solid;"

  if (paired) {
    rules += `border-width: 4px;`
  } else {
    rules += `border-width: 2px;`
  }

  if (selected) {
    rules += `border-color: #f90;`

    if (paired) {
      rules += `
        border-left-color: #840;
        border-top-color: #840;
      `
    } else {

      rules += `
        border-right-color: #840;
        border-bottom-color: #840;
      `
    }
  } else if (paired) {
    rules += `
      border-color: #090;
      border-left-color: #040;
      border-top-color: #040;
    `
  } else {
    rules += `
      border-color: #ccc;
    `
  }

  // console.log("rules:", rules)

  return rules
}


export const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: calc(100 * var(--w));
  height: calc(100 * var(--h));
  ${props => props.aspectRatio < 1
           ? `flex-direction: column;
             `
           : `flex-direction: row;
             `
   };

  & > div:not(.teacher) {
    ${props => getCompareRules(props.aspectRatio < 1, props.count)}
  }

  & > div > div {
    ${props => getFrameRules(props.aspectRatio, props.count)}
  }

  & > div > div:last-of-type {
    top: auto;
    left: auto;
    bottom: 0;
    right: 0;
  }

  & ul {
    ${props => getListRules(props.aspectRatio < 1, props.count)}
  }

  & li {
   ${props => (props.aspectRatio < 1)
     ? `display: inline-block;
       `
     : ""
    }
  }
`


export const StyledFrame = styled.div`
  position: relative;
  box-sizing: border-box;
  border: 1px solid #fff;

  border-color: ${
    props => props.selected
           ? `#f90`
           : props.paired
             ? `#090`
             : `#999`
  };


  & img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &.fullscreen {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.9);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
    border: none;
  }
`


export const StyledList = styled.ul`
  list-style-type: none;
  padding: 0px;
  margin: 0px;
  text-align: center;

  ${props => props.top
    ? `top: 0;
       left: 0;
      `
    : `bottom: 0;
       right: 0;
      `
   }

  ${props => props.locked
    ? `background: #600;
      `
    : `background: #060;
      `
   }
`

// props.aspectRatio < 1
//       ? `top: 0;
//          left: calc(15 * var(--min));
//          width: calc(85 * var(--w));
//         `
//       : `top: calc(15 * var(--min));
//          left: 0;
//          height: calc(85 * var(--h));
//         `


export const StyledThumbnail = styled.li`
  cursor: pointer;
  clear: both;

  position: relative;
  width: calc(${size} * var(--min));
  height: calc(${size} * var(--min));
  font-size: calc(2 * var(--min));
  box-sizing: border-box;
  margin: 0 auto;

  ${props => getThumbnailBorder(props.selected, props.paired)};

  & img {
    object-fit: contain;
    width: 100%;
    height: 100%;
  }

  & span {
    position: absolute;
    width: 100%;
    left: 0;
    bottom: 0;
    text-align: center;
    background-color: rgba(0,0,0,0.5);
    padding: 0.25em 0;
    visibility: hidden;
  }

  &:hover span {
    visibility: visible;
  }
`

export const StyledButton = styled.button`
  position: absolute;
  top: calc(50% - (${buttonSize} * var(--min)) / 2);
  left: calc(50% - (${buttonSize} * var(--min)) / 2);

  width: calc(${buttonSize} * var(--min));
  height: calc(${buttonSize} * var(--min));

  border: 1px solid white;
  border-radius: calc(${buttonSize} * var(--min));
  opacity: 0.8;
  outline: none;

  ${
    props => props.paired
           ? `background-image:url("${tick}");`
           : ""

  }

  &:hover {
    opacity: 1;
    ${
      props => props.update
             ? props.paired
               ? `background-image:url("${cross}");
                 `
               : `background-image:url("${tick}")
                 `
             : ""

    }
  }
`

export const StyledControls = styled.div`
  position: relative;
  width: auto;
`

export const StyledLock = styled.button`
  position: absolute;
  top: 0;
  left: 0;
  width: calc(4 * var(--min));
  height: calc(4 * var(--min));
  background-image: url("${props => props.locked
                                  ? locked
                                  : opened
  }");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  background-color: #fff;
  border: calc(0.5 * var(--min)) solid #fff;
  border-radius: 100%;

  &:focus {
    outline: none;
  }

`