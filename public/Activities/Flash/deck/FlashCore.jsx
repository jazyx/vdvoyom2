/**
 * /public/activities/Flash/deck/FlashCore.jsx
 */


import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import styled from 'styled-components'




export const StyledUL = styled.ul`
  height: 90vh;
  overflow-y: auto;

  & li {
    text-align: center;
    list-style: none;
  }

  & li span {
    width: 20vw;
    display: inline-block;
  }
`



export default class Flash extends Component {
  constructor(props) {
    super(props)
    this.check = this.check.bind(this)
  }


  check(result) {
    const timeStamp = this.props.queue[0].next_seen
    this.props.treatResult(result, timeStamp)
  }


  getView() {
    const phrases = this.props.queue.map((phrase, index)=>{
      const text = phrase.phrase
      const time = new Date(phrase.next_seen).toTimeString()
                                             .substring(0,8)
      const _id = phrase.phrase_id
      const [ fail, pass ] = index
                           ? ["", ""]
                           : [ <button
                                onMouseUp={() =>
                                  this.check({[_id]: false})
                                }
                               >
                                 Fail
                               </button>
                             , <button
                                onMouseUp={() =>
                                  this.check({[_id]: true})
                                }
                               >
                                 Pass
                               </button>
                              ]
      return <li
        key={phrase._id}
      >
        {fail}
        <span>
          {time} {text}
        </span>
        {pass}
      </li>
    })
    return <StyledUL
      {...this.props}
    >
      {phrases}
    </StyledUL>
  }


  render() {
    // const View = this.views[this.props.view]
    // console.log("Flash", JSON.stringify(this.props, null, "  "))
    // { "view": "Vocabulary",
    //   "aspectRatio": 0.6974789698307008,
    //
    //   "code": "en-GB",
    //   "d_code": "qUvfiS3",
    //   "user_id": "GpfaJouezuPfjFHbk",
    //   "group_id": "F7qpd3trDN53R53rb",
    //
    //   "uiText": {
    //     "congratulations": "Congratulations!",
    //     "play_again": "Play Again"
    //   },
    //
    //   "path": "/Vocabulary/basic",
    //   "tag": "basic",
    //   "isMaster": true,
    //
    //   "items": [
    //      { "_id": "yhhFtet2cPQEcPisT",
    //        "phrase": "soup",
    //        "image": "/Assets/Vocabulary/basic/image/1.jpg"
    //      },
    //    ...],
    //   "queue": [
    //      { "collection": "Vocabulary",
    //        "next_seen": 1595749154886,
    //        "phrase_id": "yhhFtet2cPQEcPisT",
    //        "times_seen": 0,
    //        "_id": "yhhFtet2cPQEcPisT",
    //        "phrase": "soup",
    //        "image": "/Assets/Vocabulary/basic/image/1.jpg"
    //      },
    //    ...],
    //    "unseen": [
    //    { "collection": "Vocabulary",
    //      "next_seen": 1595749154886,
    //      "phrase_id": "yhhFtet2cPQEcPisT",
    //      "times_seen": 0,
    //      "_id": "yhhFtet2cPQEcPisT",
    //      "phrase": "soup",
    //      "image": "/Assets/Vocabulary/basic/image/1.jpg"
    //    },
    //    ...],
    //    "cued": [
    //      "yhhFtet2cPQEcPisT",
    //      "cBmXQ6qF8ZvsvTPsd",
    //      "WgGmnPZthjxsfZiks",
    //    ...]
    //  }

    const View = this.getView()

    return View
  }
}
