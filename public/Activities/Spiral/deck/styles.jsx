/**
 * /public/activities/Spiral/deck/styles.jsx
 */



import styled from 'styled-components'

import { phi
       , thick
       , thin
       } from './constants'



export const StyledFrame = styled.div`
  position: absolute;
  box-sizing: border-box;
  left: ${props => props.left};
  top: ${props => props.top};

  width: ${props => props.width || "100%"};
  height: ${props => props.height || "50%"};

  ${props => {
    if (props.lead) {
      return ""
    }
    switch (props.position) {
      case "top":
        return "border-bottom: 1px solid #fff;"
      case "left":
        return "border-right: 1px solid #fff;"
      case "right":
        return "border-left: 1px solid #fff;"
      case "bottom":
        return "border-top: 1px solid #fff;"
    }
  }}

  &.no-border {
    border: none;
  }
`



export const StyledImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;

  ${props => {
    switch (props.place) {
      case "top":
        return `
          height: ${thick}%;
        `
      case "left":
        return `
          width: ${thick}%;
        `
      case "right":
        return `
          width: ${thick}%;
          left: ${thin}%;
        `
      case "bottom":
        return `
          height: ${thick}%;
          top: ${thin}%;
        `
    }
  }}
`



export const StyledMain = styled.main`
  position: relative;
  border: 1px solid #fff;
  box-sizing: border-box;

  ${props => {
    if (props.aspectRatio < 1000/1618) {
      return `width: calc(100 * var(--w));
              height: calc(${phi * 100} * var(--w));
             `
    } else if (props.aspectRatio < 1) {
      return `height: calc(100 * var(--h));
               width: calc(${thick} * var(--h));
             `
    } else if (props.aspectRatio < 1618/1000) {
      return `width: calc(100 * var(--w));
              height: calc(${thick} * var(--w));
             `
    } else {
      return `height: calc(100 * var(--h));
              width: calc(${phi * 100} * var(--h));
             `
    }
  }}
`