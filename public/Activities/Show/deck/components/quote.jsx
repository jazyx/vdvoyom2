/**
 * /public/Activities/Show/deck/components/header_quote.jsx
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

  & h1 {
    font-size: 1.1em;
    font-weight: bold;
    color: var(--linkColor)
  }

  & p {
    margin: 0;
  }

  & b {
    color: var(--menuColor);
  }
`


export default class Quote extends Component {
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


  getHeaderAndText(legend) {
    const regex = /(?:#([^#]+)#)?([\S\s]*)/
    const match = regex.exec(legend)

    if (!match) {
      return "" + legend
    }

    let [ , header, text ] = match
    if (header) {
      header = this.addLinks(header, "h1", "_ele")
    }

    text = text.split("\n")
    let lastIndex = text.length - 1

    text = text.map(
      ( paragraph, index ) => {
        const ref = index === lastIndex ? this.pRef : ""
        paragraph = this.addFontStyles(paragraph, "p", index, ref)
        return paragraph
      }
    )

    return { header, text }
  }


  addLinks(text, Tag, target) {
    const regex = /\[([^\]]+)]\(([^)]+)\)/g

    const children = []
    let start = 0
    let match

    while (match = regex.exec(text)) {
      const anchor = match[1]
      const href = match[2]
      const index = match.index
      const length = 1 + anchor.length + 1 + 1 + href.length + 1

      const link = <a
        key={index}
        href={href}
        target={target}
      >
        {anchor}
      </a>
      children.push(text.substring(start, index), link)
      start = index + length
    }

    children.push(text.substring(start))

    const component = <Tag>{children}</Tag>

    return component
  }


  addFontStyles(text, Tag, key, ref) {
    const regex = /(?:\b_(\w.*?\w)_\b)|(?:[\^\s]\*(\w.*?\w)\*[$\s])/g
    const children = []
    let start = 0
    let match
      , tag
      , length

    while (match = regex.exec(text)) {
      let index = match.index
      const [, italic, bold] = match

      if (italic) {
        tag = <i key={index}>{italic}</i>
        length = 1 + italic.length + 1
      } else {
        tag = <b key={index}>{bold}</b>
        index += !!index
        length = 1 + bold.length + 1
      }

      children.push(text.substring(start, index), tag)
      start = index + length
    }

    children.push(text.substring(start))

    const component = <Tag
      key={key}
      ref={ref}
    >
      {children}
    </Tag>

    return component
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

    let { menu, aspectRatio, limit, legend, image } = this.props
    let direction
      , src

    if (!image) {
      image = {}
    }

    if (aspectRatio < limit) {
      direction = "column"
      src = image.h

    } else {
      if (this.props.textPosition === "left") {
        direction = "row-reverse"

      } else {
        direction = "row"
      }

      src = image.v
    }

    let { header, text } = this.getHeaderAndText(legend[0].legend)
    const img = src
              ? <img
                  src={src}
                  alt={menu}
                  ref={this.imageLoading}
                />
              : ""

    // console.log("menu:", menu, "aspectRatio:", aspectRatio)
    // console.log("limit:", limit, "legend:", legend, "image:", image)
    // console.log("header:", header, "text:", text)

    return <StyledQuote
      direction={direction}
    >
      {src}
      <div
        ref={this.divRef}
      >
        {header}
        {text}
      </div>
    </StyledQuote>
  }


  componentDidMount() {
    this.fitFont()
  }


  componentDidUpdate() {
    this.fitFont()
  }
}