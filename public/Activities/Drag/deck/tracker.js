/**
 * /public/activities/Drag/deck/tracker.js
 *
 */



import Tracker from '../../shared/tracker'



export class DragTracker extends Tracker {
  constructor() {
    const uiTextSelector = {
      $or: [
        { cue: "congratulations" }
      , { cue: "play_again" }
      ]
    }

    super(uiTextSelector)
  }


  getProps() {
    const props     = super.getProps("Drag")
    props.completed = this.turnCompleted(props.data)

    return this.props
    /* { code
     * , d_code
     * , user_id
     * , group_id
     * , logged_in // used by Drag to tell if pilot is still online
     * , uiText
     * , path
     * , tag
     * , data
     * , isMaster
     *
     * // master only //
     * , items // [{ phrase, image, audio, native }]
     *
     * , completed // custom
     * }
     */
  }


  turnCompleted(data) {
    let completed = 0

    if (typeof data === "object") {
      const show = data.show

      if (typeof show === "object") {
        const keys = Object.keys(show)
        completed = keys.reduce(
          (counter, key) => counter + show[key]
        , completed)
      }
    }

    return completed === 6
  }
}
