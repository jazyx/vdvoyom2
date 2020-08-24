/**
 * /public/Activities/Show/deck/components/video.jsx
 *
 * 
 */


import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'

import { StyledMask
       , StyledButtons
       , StyledRewind
       , StyledPause
       } from '../styles'

import { setPageData } from '/imports/api/methods/admin.js'



export class Video extends Component {
  constructor(props) {
    super(props)

    this.rewind = this.rewind.bind(this)
    this.togglePlay = this.togglePlay.bind(this)
    this.togglePause = this.togglePause.bind(this)
    this.playerReady = this.playerReady.bind(this)
    this.playerStateChange = this.playerStateChange.bind(this)

    this.paused = !!this.props.paused
  }


  rewind() {
    const group_id = this.props.group_id
    const data = {
      rewound: true
    , paused: true
    }

    setPageData.call({
      group_id
    , data
    })

  }


  togglePlay(paused) {   
    if (paused) {
      this.player.pauseVideo()
    } else {
      this.player.playVideo()
      this.rewound = false
    }

    this.paused = !!paused
  }


  togglePause(paused) {
    const group_id = this.props.group_id
    const data = { paused: !this.props.paused}

    setPageData.call({
      group_id
    , data
    })
  }


  playerReady() {
    this.isReady = true
    if (!this.props.paused) {
      this.togglePlay()
    }
  }


  playerStateChange(event) {
    // console.log("playerStateChange", event)
  }


  render() {
    let buttons = ""
    if (this.props.isPilot) {
      buttons = <StyledButtons>
        <StyledRewind
          onMouseUp={this.rewind}
        />
        <StyledPause
          paused={this.props.paused}
          onMouseUp={this.togglePause}
        />
      </StyledButtons>
    }

    return <div>
      <div
        id={this.props.videoId}
      />
      <StyledMask
        className="mask"
      />
      {buttons}
    </div>
  }


  componentDidMount() {
    // console.log("VIDEO", JSON.stringify(this.props, null, "  "))
    // "_id": "9kL6jhd4w54SfoR2H",
    // "group_id": "mq8AQPdazsJg2QRz4",
    // "name": "grass",
    // "menu": "Cмотреть, как растет трава",
    // "layout": "video",
    // 
    // "videoId": "rtFs6weCsHI",
    // "width": 1472,
    // "height": 974,
    // "rect": {
    //   "width": 418.21795654296875,
    //   "height": 754.0596313476562,
    //   "top": 0,
    //   "left": 0
    // },
    // "isPilot": true

    let { videoId, width, height, rect } = this.props
    const videoRatio = width / height
    const aspectRatio = this.props.aspectRatio

    if (videoRatio > aspectRatio) {
      height = "" + rect.width / videoRatio
      width  = "" + rect.width
    } else {
      width  = "" + rect.height * videoRatio
      height = "" + rect.height
    }

    this.player = new YT.Player(videoId, {
      height
    , width
    , videoId
    , events: {
        'onReady': this.playerReady
      , 'onStateChange': this.playerStateChange
      }
    })
  }


  componentDidUpdate() {
    if (!this.isReady) {
      return
    }

    const { paused, rewound } = this.props
    if (this.rewound !== rewound) {
      this.player.seekTo(0, true)
      this.rewound = rewound
    }
    if (this.paused !== paused) {
      this.togglePlay(paused)
    }
  }
}