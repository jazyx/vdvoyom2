/**
 * /public/Activities/Cloze/deck/clozeDelta.js
 */



import LSS from './lss'



/* expectedOutput and receivedOutput are arrays containing the
 * full string that is expected and been input. We place each of
 * these arrays inside an enclosing array, to indicate that they
 * are to be treated.
 *
 * The treatment consists of taking the first item from each
 * toTreat array, and looking for the longest sub-string (lss).
 * If there is no lss, then all the letters in the chunks are
 * different. If there is an lss, then the chunk can be divided
 * three parts: before, lss and after. (Either before or after or
 * both may be an "" empty string). The arrays containing the
 * Before and After chunks are returned to the toTreat arrays for
 * further treatment.
 *
 * However, the initial ~Output arrays will have been removed
 * from the toTreat arrays. The divided arrays will be placed in
 * these ~Output arrays in the original order. When a divided
 * is treated, its components will be placed inside itself in the
 * same way. The order of the characters is thus maintained in
 * deeper and deeper nested sub-arrays, until there are no more
 * chunks to treat.
 *
 * At this point, the ~Output arrays are flattened into a non-
 * nested array of chunks which are either identical in both
 * expected and received, or different. They can be different in
 * three ways:
 *
 * * One is empty while the other contains text (Add | Cut)
 * * Both contain text which share no common characters (Fix)
 * * Both contain two characters in two different orders (Flip)
 *   These last two cases are treated by treatFix()
 *
 * Finally, getClozeFromReceivedOutput() creates a sequence of
 * spans where the text and background have the appropriate
 * colours.
 */
export class ClozeDelta {
  constructor (due, got) {
    this.due = due
    this.got = got

    this.error = false
    this.dueOutput = [this.normalizeText(this.due)]
    this.gotOutput = [this.normalizeText(this.got)]
    this.dueQueue  = [this.dueOutput]
    this.gotQueue  = [this.gotOutput]
  }


  /* The contents of ~Arrays extracted from the toTreat variable
   * are broken into sub-arrays as they are treated. The sub-arrays
   * are maintained in the original order of the text. Any sub-array
   * that needs further treatment is returned toTreat; those that
   * have been completely treated are not returned. As a result, the
   * original this.dueOutput and this.gotOutput arrays retain the
   * orginal text, just broken into (deeply nested) arrays.
   */   
  getDelta() {
    while (this.dueQueue.length) {
      const dueArray = this.dueQueue.pop() // arrays
      const gotArray = this.gotQueue.pop()
      const due      = dueArray[0]         // strings
      const got      = gotArray[0]

      if (!due || !got) {
        // Add or cut: one or both may be empty

      } else {
        const lss = LSS(due, got)

        // console.log(dueArray, gotArray, lss)

        switch (lss.length) {
          case 0:
            // There is nothing in common in these strings.
            this.error = true
          break

          case 1:
            // There may be more matching letters, but flipped
            this.error = this.lookForSwaps(dueArray, gotArray, lss)
          break

          default:
            this.splitStrings(dueArray, gotArray, lss)
        }
      }
    }

    /* The deeply nested arrays are restored to single-level arrays
     * of chunks whose positions match. Each pair of chunks is one of
     * the following:
     * * identical
     * * an omission
     * * an addition
     * * wrong
     * * flipped characters
     */

    this.dueOutput = this.flatten(this.dueOutput)
    this.gotOutput = this.flatten(this.gotOutput)

    this.restoreCase(this.gotOutput, this.got)

    return {
      due: this.dueOutput
    , got: this.gotOutput
    , error: this.error
    }
  }

  // const maxLength = this.state.due.length + this.maxExtraChars
  // const reveal = this.requireSubmit && !this.got
  // const fix = (this.requireSubmit && error) || reveal

  // this.setState({ cloze, error, correct, maxLength, reveal, fix })

  // this.input = this.got
  // this.error = this.error || error


  normalizeText(string) {
    string = string.toLowerCase()
                   .replace(/ /g, " ")
                   // .replace(/ё/g, "е")
    return string
  }


  lookForSwaps(dueArray, gotArray, lss) {
    const dueString = dueArray[0]
    const gotString = gotArray[0]
    const eLength = dueString.length - 1 // -1 so we don't
    const rLength = gotString.length - 1 // overrun with ii + 1
    let dontSplit = false

    if (eLength && rLength) {
      for ( let ii = 0; ii < eLength; ii += 1 ) {
        const ch1 = dueString[ii]
        const offset1 = gotString.indexOf(ch1)

        if (offset1 < 0) {
          // No match, so no flipped pair, so move on

        } else {
          const ch2 = dueString[ii + 1]
          const offset2 = gotString.indexOf(ch2)

          if (offset2 < 0) {
            // The second element of the pair is missing. No match.

          } else if (Math.abs(offset1 - offset2) === 1) {
            // We've found a swap. Split the strings into three
            this.splitStringAt(ch1+ch2, dueArray, this.dueQueue)
            this.splitStringAt(ch2+ch1, gotArray, this.gotQueue)

            // There may be more swaps further along, but they will
            // be treated in a subsequent iteration of the while
            // loop below
            dontSplit = true
            this.error = true
            break
          }
        }
      }
    }

    if (!dontSplit) {
      this.splitStrings(dueArray, gotArray, lss)
    }
  }


  splitStringAt(chunk, array, queue) {
    const string = array.pop()
    const offset = string.indexOf(chunk)
    const offend = offset + chunk.length

    const before = [string.substring(0, offset)]
    array.push(before)
    queue.push(before)

    array.push(chunk)

    const after  = [string.substring(offend)]
    array.push(after)
    queue.push(after)
  }


  splitStrings(dueArray, gotArray, lss) {
    this.splitStringAt(lss, dueArray, this.dueQueue)
    this.splitStringAt(lss, gotArray, this.gotQueue)
  }


  flatten(array, flattened=[]) {
    let item

    // "" is falsy, but we need to treat empty string items, so we
    // need a tricky `while` expression which will return true for
    // any array or string, even if it's empty, while at the same
    // time setting `item` to the value shifted from the array.
    // When the array is empty, item will take the value `undefined`
    // and the while expression will return false.

    while ((item = array.shift(), !!item || item === "")) {

      if (Array.isArray(item)) {
        item = this.flatten(item)
        item.forEach(entry => {
          flattened.push(entry)
        })

      } else {
        flattened.push(item)
      }
    }

    return flattened
  }


  restoreCase(array, original) {
    let start = 0
    let end = 0

    array.forEach((chunk, index) => {
      end += chunk.length
      array[index] = original.substring(start, end)
      start = end
    })
  }
}


window.ClozeDelta = ClozeDelta