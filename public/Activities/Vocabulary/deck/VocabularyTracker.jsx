/**
 * /public/activities/Vocabulary/deck/VocabularyTracker.jsx
 */



import FluencyTracker from '../../shared/fluencyTracker'

import { getLocalized } from '/imports/tools/generic/utilities'



export default class VocabularyTracker extends FluencyTracker {
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
    const props = super.getProps("Vocabulary")

    // FluencyTracker adds queue, cued and unseen to props for master

    // console.log(JSON.stringify(props, null, "  "))

    return props
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
     * , queue
     * , cued
     * , unseen
     * }
     */
  }
}
