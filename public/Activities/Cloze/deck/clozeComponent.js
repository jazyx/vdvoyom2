/**
 * /public/Activities/Cloze/deck/clozeComponent.js
 */



import React, { Component } from 'react';

import { Add
       , Cut
       , Fix
       , Flip
       } from './inputs'



export const clozeComponent = (
    right
  , wrote
  , rightArray
  , wroteArray
  , error
  , requireSubmit
  , fromNewPhrase
  ) => {


  requireSubmit = !!requireSubmit
  incomplete    = false
  lastIndex     = wroteArray.length
  typeIndex     = lastIndex - 1


  const generateComponent = () => {
    let correct
      , cloze
      
    if (requireSubmit) {
      cloze = getClozeFromDueOutput()
    } else {
      cloze = getClozeFromGotOutput()
    }

    if (cloze.length === 1) {
      if (wrote.length === right.length
        && !fromNewPhrase
         ) {
        correct = true
      }

    } else if (cloze.length && !incomplete) {
      // if incomplete, there will be two chunks: what was
      // typed + what remains to be typed
      error = true
    }

    if (!cloze.length) {
      cloze = [zeroWidthSpace]
    }

    return {
      cloze
    , correct
    , error
    }
  }


  const getClozeFromGotOutput = () => {
    const cloze = []

    wroteArray.forEach((wrote, index) => {
      const key = index + wrote
      const right = rightArray[index]
      const hasSpace = (wrote !== wrote.replace(/ /g, "")) + 0

      if (wrote.toLowerCase() === right) {
        if (wrote) { // ignore empty items
          cloze.push(<span
            key={key}
          >{wrote}</span>)
        }

      } else if (!wrote) {
        if (right && index !== lastIndex) {
          // Text is missing in the input...
          if (cloze.length === 1 && index === typeIndex) {
            // ... but everything up to this point is correct
            incomplete = true
          }

          //
            cloze.push(<Add
              key={key}
              has_space={hasSpace}
            />)
        } // else both wrote and right are "", for the last item

        // TODO: Set a timeout so that index !== lastIndex is
        // ignored if you stop typing before you reach the end.

      } else if (!right) {
        cloze.push(<Cut
          key={key}
          has_space={hasSpace}
        >{wrote}</Cut>)

      } else {
        treatFix(wrote, right, key, cloze, hasSpace)
      }
    })

    return cloze
  }


  const getClozeFromDueOutput = () => {
    const cloze = []

    rightArray.forEach((right, index) => {
      const key = index + right
      const wrote = wroteArray[index]
      const hasSpace = (right !== right.replace(/ /g, "")) + 0

      if (right.toLowerCase() === wrote) {
        if (right) { // ignore empty items
          cloze.push(<span
            key={key}
          >{right}</span>)
        }

      } else if (right) {
        if (!wrote) {
          if (index !== lastIndex) {
            // Text is missing in the input...
            if (cloze.length === 1 && index === typeIndex) {
              // ... but everything up to this point is correct
              incomplete = true
            }
          }

          cloze.push(<Cut
            key={key}
            has_space={hasSpace}
          >{right}</Cut>)

        } else {
          treatFix(right, wrote, key, cloze, hasSpace)
        }
      }
    })

    return cloze
  }


  const treatFix = (display, compare, key, cloze, hasSpace) => {
    if ( compare[0] === display[1]
      && compare[1] === display[0]
       ) {

      cloze.push(<Flip
        key={key}
        has_space={hasSpace}
      >{display}</Flip>)

      return
    }

    cloze.push(<Fix
      key={key}
      has_space={hasSpace}
    >{display}</Fix>)
  }


  return generateComponent()
}


window.clozeComponent = clozeComponent