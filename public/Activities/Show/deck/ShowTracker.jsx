/**
 * /public/activities/Show/deck/ShowTracker.jsx
 */



import Tracker from '../../shared/tracker'

import { getLocalized } from '/imports/tools/generic/utilities'
import { IMAGE_REGEX } from '/imports/tools/custom/constants'

import collections from '/imports/api/collections/publisher'
const { Show  } = collections



export default class ShowTracker extends Tracker{
  getProps(collectionName = "Show") {
    this.collectionName = collectionName
    const props = super.getProps(collectionName)

    return props
  }


  getLocalizedItem(document) {
    if (typeof document.menu === "object") {
      document.menu = getLocalized(document.menu, this.code)

    } else {
      delete document.menu 
    }

    if (Array.isArray(document.legend)) {
      document.legend = document.legend.map( legendData => (
        { id: legendData.id
        , legend: getLocalized(legendData, this.code)
        }
      ))

    } else {
      delete document.legend 
    }

    if (Array.isArray(document.image)) {
      document.image = document.image.reduce(( map, imageData ) => {
        const src   = imageData.src
        const match = IMAGE_REGEX.exec(src)
        const name  = match[1]
        map[name]   = imageData.src

        return map
      }, {})
    }

    delete document.tags 

    return document
  }


  addCustomProps(props) {
    if (!props.isMaster) {
      props.items = this.getItems(this.collectionName, props.tag)
    }
    props.isPilot = !props.active || props.soloPilot === props.d_code
  }
}