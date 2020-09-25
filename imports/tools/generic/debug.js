/**
 * /home/blackslate/Repos/Tests/renderDelta/debug.js
 *
 *
 */


import { valuesDontMatch } from './utilities.js'


const oldClones = {}


const getChanges = (name, object) => {
  const changes = {

  }
  const newClone = {...object}
  const clone = oldClones[name] || (oldClones[name] = {...object}, 0)
  if (!clone) {
    return newClone
  } else {
    oldClones[name] = newClone
  }

  for (const key in object) { // state, props
    const now = newClone[key]
    const old = clone[key]

    const change = valuesDontMatch(old, now)
    if (change) {
      changes[key] = change
    }
  }

  return changes
}


const getRenderTriggers = (instance) => {
  const name = instance.constructor.name
  const { state, props } = instance
  const object = {
    state: {...state}
  , props: {...props}
  }

  const changes = getChanges(name, object)

  return changes
}


export const logRenderTriggers = (label, instance, silent) => {
  const changes = getRenderTriggers(instance)

  // if (!silent) {
  //   console.log(
  //     label
  //   , JSON.stringify(changes, null, "  ")
  //   )
  // }

  const triggered = !!Object.keys(changes).length

  return triggered
}