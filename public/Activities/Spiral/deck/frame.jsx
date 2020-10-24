/**
 * /public/activities/Spiral/deck/frame.jsx
 */



import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';

import { StyledFrame
       , StyledImage
       } from './styles'



export const Frame = (props) => (
  <StyledFrame
    className={
      props.className
      + " aspect-"+props.aspect
      + " " + "position-"+props.position
      + " " + "place-"+props.place
    }
    top={props.top}
    lead={props.lead}
    left={props.left}
    place={props.place}
    width={props.width}
    height={props.height}
    aspect={props.aspect}
    position={props.position}
  >
    <StyledImage
      src={props.src}
      lead={props.lead}
      place={props.place}
    />
    {props.children}
  </StyledFrame>
)
