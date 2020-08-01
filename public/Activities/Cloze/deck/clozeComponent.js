/**
 * /public/Activities/Cloze/deck/clozeComponent.js
 */



import React, { Component } from 'react';

import { Add
       , Cut
       , Fix
       , Flip
       } from './inputs'



export class ClozeComponent{
  getComponent({ due, got, error}, requireSubmit, fromNewPhrase) {
    this.dueOutput = due
    this.gotOutput = got
    this.error     = error
    this.requireSubmit = !!requireSubmit
    this.onlyEndIsMissing = false

    due = due.join("")
    got = got.join("")

    this.lastIndex = this.gotOutput.length
    this.typeIndex = this.lastIndex - 1

    let correct
      , cloze
      
    if (this.requireSubmit) {
      cloze = this.getClozeFromDueOutput()
    } else {
      cloze = this.getClozeFromGotOutput()
    }

    if (cloze.length === 1) {
      if (got.length === due.length
        && !fromNewPhrase
         ) {
        correct = true
      }

    } else if (cloze.length && !this.onlyEndIsMissing) {
      // if onlyEndIsMissing, there will be two chunks: what was
      // typed + what remains to be typed
      this.error = true
    }

    if (!cloze.length) {
      cloze = [this.zeroWidthSpace]
    }

    return {
      cloze
    , correct
    , error: this.error
    }
  }


  getClozeFromGotOutput() {
    const cloze = []

    this.gotOutput.forEach((got, index) => {
      const key = index + got
      const due = this.dueOutput[index]
      const hasSpace = (got !== got.replace(/ /g, "")) + 0

      if (got.toLowerCase() === due) {
        if (got) { // ignore empty items
          cloze.push(<span
            key={key}
          >{got}</span>)
        }

      } else if (!got) {
        if (due && index !== this.lastIndex) {
          // Text is missing in the input...
          if (cloze.length === 1 && index === this.typeIndex) {
            // ... but everything up to this point is correct
            this.onlyEndIsMissing = true
          }

          //
            cloze.push(<Add
              key={key}
              has_space={hasSpace}
            />)
        } // else both got and due are "", for the last item

        // TODO: Set a timeout so that index !== lastIndex is
        // ignored if you stop typing before you reach the end.

      } else if (!due) {
        cloze.push(<Cut
          key={key}
          has_space={hasSpace}
        >{got}</Cut>)

      } else {
        this.treatFix(got, due, key, cloze, hasSpace)
      }
    })

    return cloze
  }


  getClozeFromDueOutput() {
    const cloze = []

    this.dueOutput.forEach((due, index) => {
      const key = index + due
      const got = this.gotOutput[index]
      const hasSpace = (due !== due.replace(/ /g, "")) + 0

      if (due.toLowerCase() === got) {
        if (due) { // ignore empty items
          cloze.push(<span
            key={key}
          >{due}</span>)
        }

      } else if (due) {
        if (!got) {
          if (index !== this.lastIndex) {
            // Text is missing in the input...
            if (cloze.length === 1 && index === this.typeIndex) {
              // ... but everything up to this point is correct
              this.onlyEndIsMissing = true
            }
          }

          cloze.push(<Cut
            key={key}
            has_space={hasSpace}
          >{due}</Cut>)

        } else {
          this.treatFix(due, got, key, cloze, hasSpace)
        }
      }
    })

    return cloze
  }


  treatFix(display, compare, key, cloze, hasSpace) {
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
}


window.ClozeComponent = ClozeComponent