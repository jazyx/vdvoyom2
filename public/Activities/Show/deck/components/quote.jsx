/**
 * /public/Activities/Show/deck/components/quote.jsx
 *
 *
 */


import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import styled from 'styled-components'



const StyledQuote = styled.div`
  display: flex;
  flex-direction: ${props => props.direction};
  width: calc(100 * var(--w));
  height: calc(100 * var(--h));

  & img {
    ${props => props.direction === "column"
             ? `width: 100%;
                height: auto;
               `
             : `height: 100%;
                width: auto;
               `
     }
  }

  & div {
    box-sizing: border-box;
    padding: 0.75em;
  }

  & p {
    margin: 0;
  }
`


export class Quote extends Component {
  constructor(props) {
    super(props)

    this.divRef = React.createRef()
    this.pRef = React.createRef()
    this.fitFont = this.fitFont.bind(this)
    this.imageLoading = this.imageLoading.bind(this)

    window.addEventListener("resize", this.fitFont, false)
  }


  imageLoading(image) {
    if (!image) {
      // Caused when moving to a different view
      return
    }

    if ( image.complete && image.naturalWidth ) {
      return this.fitFont()
    }

    image.addEventListener("load", this.fitFont, {once: true})
  }


  fitFont() {
    const div = this.divRef.current
    if (!div) {
      return
    }

    const p = this.pRef.current
    const FUDGE = 64
    const bottom = div.parentNode.getBoundingClientRect().bottom - FUDGE 
    let fontSize = 128
    let delta = fontSize
    let counter = 16

    while (counter--) {
      div.style.fontSize = fontSize + "px"

      delta /= 2
      if (p.getBoundingClientRect().bottom > bottom) {
        fontSize = fontSize - delta
      } else {
        fontSize = fontSize + delta
      }
    }

    if (p.getBoundingClientRect().bottom > bottom) {
      div.style.fontSize = fontSize - delta
    }
  }


  render() {
    // console.log("QUOTE", JSON.stringify(this.props, null, "  "))
    // { "_id": "TvfpevCvE5TdxJ5qa",
    //   "name": "HopeJahren",
    //   "menu": "Почва",
    //   "layout": "quote",
    //   "limit": 0.8,
    //   "legend": [
    //     {
    //       "id": "HopeJahren",
    //       "legend": "Почва - забавная штука...мы называем «почвой»."
    //     }
    //   ],
    //   "image": {
    //     "h": "/Assets/Show/OatsAndBeans/image/HopeJahren/h.jpg",
    //     "v": "/Assets/Show/OatsAndBeans/image/HopeJahren/v.jpg"
    //   },
    //   "aspectRatio": 0.937
    // }

    const { menu, aspectRatio, limit, legend, image } = this.props
    let direction
      , src

    if (aspectRatio < limit) {
      direction = "column"
      src = image.h
    } else {
      direction = "row"
      src = image.v
    }

    let text = legend[0].legend.split("\n")
    let lastIndex = text.length - 1
    text = text.map(( paragraph, index ) => (
                     <p
                       key={index}
                       ref={index ===lastIndex ? this.pRef : ""}
                     >
                       {paragraph}
                     </p>
                   ))

    return <StyledQuote
      direction={direction}
    >
      <img
        src={src}
        alt={menu}
        ref={this.imageLoading}
      />
      <div
        ref={this.divRef}
      >{text}</div>
    </StyledQuote>
  }
}