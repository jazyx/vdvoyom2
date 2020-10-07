/**
 * /public/activities/Show/deck/styles.jsx
 *
 * See /client/main.css for :root definition of colors and padding
 */



import styled from 'styled-components'


const size = 12
const rail = "16px" // depends on OS?

const getListRules = (portrait, count) => {
  // The lists are always across the min sides
  const extent      = count * size
  const needsScroll = extent > 100
  const pad         = (100 - extent) / 2
  const space = needsScroll
              ? `calc(${rail} + ${size} * var(--min )+ 3px)` // scroll
              : `calc(${size} * var(--min) + 3px)`           // no scroll
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
  ? `calc(100*var(--max) - 6px - 2*(${rail} + ${size} * var(--min)))`
  : `calc(100*var(--max) - 6px - 2*(${size} * var(--min)))`


  // ? `calc(100 * var(--max) - 2 * (${rail} + ${size} * var(--min)))`
  // : `calc(100 * var(--max) - 2 * (${size} * var(--min)))`

  if (portrait) {
    return `
      height: ${gapSize};
      width: 100%;
      background-color: red;
     `
  } else {
    return `
      width: ${gapSize};
      height: 100%;
      background-color: green;
     `
  }
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

  & div {
    ${props => getCompareRules(props.aspectRatio < 1, props.count)}
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


export const StyledBlock = styled.ul`
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
  border: 2px solid #000;
  margin: 0 auto;

  border-color: ${
    props => props.selected
           ? `#f90;`
           : ( props.paired )
             ? `#090;`
             : ( props.blank )
               ? "#000;"
               : `#666;`
  }

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