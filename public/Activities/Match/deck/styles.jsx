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

  ${props => props.top
           ? `top: 0;
              left: 0;
             `
           : `bottom: 0;
              right: 0;
             `
   }

  ${props => (props.aspectRatio < 1)
           ? `width: calc(100 * var(--w));
              overflow-y: auto;
              height: calc(18px + 12 * var(--min));
              white-space: nowrap;
             `
           : `height: calc(100 * var(--h));
              overflow-x: auto;
              width: calc(18px + 12 * var(--min));
             `
  }
`

export const StyledHolder = styled.div`
`


export const StyledThumbnail = styled.li`
  cursor: pointer;
  display: inline-block;
  clear: both;

  position: relative;
  width: calc(12 * var(--min));
  height: calc(12 * var(--min));
  font-size: calc(2 * var(--min));

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
    background-color: rgba(0,0,0,0.2);
    padding: 0.25em 0;
  }

`