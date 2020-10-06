/**
 * /public/activities/Show/deck/styles.jsx
 *
 * See /client/main.css for :root definition of colors and padding
 */



import styled from 'styled-components'


export const StyledHalf = styled.div`
  display: flex;
  width: calc(100 * var(--w));
  height: calc(100 * var(--h));
  ${props => props.aspectRatio > 1
           ? `flex-direction: row;
             `
           : `flex-direction: column;
             `
   };
`


export const StyledBlock = styled.ul`
  position: absolute;
  list-style-type: none;
  padding: 0px;
  margin: 0px;
  text-align: center;

  ${props => (props.aspectRatio < 1)
   ? `width: calc(100 * var(--w));
      overflow-y: auto;
      height: calc(16px + 12 * var(--min));
      white-space: nowrap;
     `
   : `height: calc(100 * var(--h));
      overflow-x: auto;
      width: calc(16px + 12 * var(--min));
     `
  }

  ${props => props.top
    ? `top: 0;
       left: 0;
      `
    : `bottom: 0;
       right: 0;
      `
   }

  & li {
   ${props => (props.aspectRatio < 1)
     ? `display: inline-block;
       `
     : ""
    }
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
  width: calc(12 * var(--min));
  height: calc(12 * var(--min));
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