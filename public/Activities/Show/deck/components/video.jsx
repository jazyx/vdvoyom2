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
       , StyledCue
       , StyledPause
       } from '../styles'

import { setPageData } from '/imports/api/methods/admin.js'



export default class Video extends Component {
  constructor(props) {
    super(props)

    this.playerReady = this.playerReady.bind(this)
    this.togglePlay = this.togglePlay.bind(this)
    this.pilotHitsRewind = this.pilotHitsRewind.bind(this)
    this.pilotJumpsTo = this.pilotJumpsTo.bind(this)
    this.pilotTogglesPause = this.pilotTogglesPause.bind(this)

    this.paused = !!this.props.paused
  }


  /** Can be called only by the user who isPilot, button unavailable
   *  to others.
   *
   *  rewound will be set to false in all cases
   */
  pilotTogglesPause(reset) {
    if (reset === "reset" && !this.props.paused) {
      return
    }

    const group_id = this.props.group_id
    const data = {
      paused: !this.props.paused
    , rewound: false
    }

    setPageData.call({
      group_id
    , data
    })
  }


  pilotJumpsTo(seconds) {
    if (seconds === this.seconds) {
      seconds += 0.001
    }
    const group_id = this.props.group_id
    const data = {
      seconds
    }

    setPageData.call({
      group_id
    , data
    })
  }


  pilotHitsRewind() {
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


  /** Called from playerReady and componentDidUpdate
   *
   * @param      {<type>}  paused  The paused
   */
  togglePlay(paused) {
    if (paused) {
      this.player.pauseVideo()

    } else {
      this.player.playVideo()
      this.rewound = false
    }

    this.paused = !!paused
  }


  playerReady() {
    this.isReady = true

    this.player.loadVideoById(this.options)

    if (!this.props.paused) {
      this.togglePlay()
    }
  }


  getButtons(cue) {
    if (!this.props.isPilot) {
      return ""
    }

    if (Array.isArray(cue)) {
      cue = cue.filter(( cuePoint, index, array ) => (
                  array.indexOf(cuePoint) === index
                ))
               .map( cuePoint => {
                  if (isNaN(cuePoint)) {
                    return 0
                  }

                  return <StyledCue
                    key={cuePoint}
                    onMouseUp={() => this.pilotJumpsTo(cuePoint)}
                  >
                    {cuePoint}
                  </StyledCue>
                })
               .filter( button => !!button )
    }

    const buttons = <StyledButtons>
      <StyledRewind
        onMouseUp={this.pilotHitsRewind}
      />
      {cue}
      <StyledPause
        paused={this.props.paused}
        onMouseUp={this.pilotTogglesPause}
      />
    </StyledButtons>

    console.log("buttons:", buttons)

    return buttons
  }


  render() {
    const buttons = this.getButtons(this.props.cue)

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

    let { videoId, width, height, rect, start, end } = this.props
    const videoRatio = width / height
    const aspectRatio = this.props.aspectRatio
    this.options = {videoId }
    if (isNaN(start) || start < 0) {
      start = 0
    }

    this.options.startSeconds = start

    if ( !isNaN(end)
       && ( (start && end > start)
         || (!start && end > 0)
          )
       ) {
      this.options.endSeconds = end
    }

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
      }
    })
  }


  componentDidUpdate() {
    if (!this.isReady) {
      return
    }

    const { paused, rewound, seconds } = this.props

    if (this.seconds !== seconds) {
      this.player.seekTo(seconds, true)
      this.seconds = seconds
    }

    if (rewound && !this.rewound) {
      this.player.seekTo(this.options.startSeconds, true)
      this.rewound = true
    }

    if (this.paused !== paused) {
      this.togglePlay(paused)
    }
  }


  componentWillUnmount() {
    if (this.props.isPilot) {
      this.pilotTogglesPause("reset")
    }
  }
}