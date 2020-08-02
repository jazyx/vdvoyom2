/**
 * /public/Activities/Cloze/deck/clozeDelta.js
 */



import LSS from './lss'



/* rightArray and wroteArray are arrays containing the full string
 * that is expected and has been input. We place each of these arrays
 * inside an enclosing ~Queue array, to indicate that they are to be
 * treated.
 *
 * The treatment consists of taking the first item from each ~Queue
 * array, and looking for the longest sub-string (lss) that they
 * share. If there is no lss, then all the letters in the chunks are
 * different. If there is an lss, then the chunk can be divided
 * three parts: before, lss and after. (Either before or after or
 * both may be an "" empty string). The arrays containing the
 * Before and After chunks are returned to the toTreat arrays for
 * further treatment.
 *
 * However, the initial ~Array's will have been removed from their
 * ~Queue arrays. The divided arrays will be placed in the ~Arrays in
 * the original order. When a divided array is treated, its components
 * will be placed inside itself in the same way. The order of the
 * characters is thus maintained in deeper and deeper nested
 * sub-arrays, until there are no more chunks queued for treatment.
 *
 * At this point, the ~Arrays are flattened into a non-nested array
 * of chunks which are either identical in both right~ and wrote~,
 * or different. They can be different in three ways:
 *
 * • One is empty while the other contains text (Add | Cut)
 * • Both contain text which share no common characters (Fix)
 * • Both contain exactly two characters in inverted orders (Flip)
 *   These last two cases are treated by treatFix()
 *
 */
export const clozeDelta = (right, wrote, submission) => {
  const normalizeText = (string) => {
    string = string.toLowerCase()
                   .replace(/ /g, " ")
    return string
  }


  let error        = false
  let incomplete   = false
  let rightArray   = [normalizeText(right)]
  let wroteArray   = [normalizeText(wrote)]
  const rightQueue = [rightArray]
  const wroteQueue = [wroteArray]


  /* The contents of ~Queues are broken into sub-arrays as they are
   * treated. The sub-arrays are maintained in the original order of
   * the text. Any sub-array that needs further treatment is returned
   * its ~Queue; those thathave been completely treated are not
   * returned. As a result, the original rightArray and wroteArray
   * arrays retain the orginal text, just broken into (deeply nested)
   * arrays.
   */
  const getDelta = () => {
    while (rightQueue.length) {
      const rightList = rightQueue.pop() // arrays
      const wroteList = wroteQueue.pop()
      const right      = rightList[0]         // strings
      const wrote      = wroteList[0]

      if (!right || !wrote) {
        // Add or cut: one or both may be empty

      } else {
        const lss = LSS(right, wrote)

        switch (lss.length) {
          case 0:
            // There is nothing in common in these strings.
            error = true
          break

          case 1:
            // There may be more matching letters, but flipped
            error = lookForSwaps(rightList, wroteList, lss)
          break

          default:
            splitStrings(rightList, wroteList, lss)
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

    rightArray = flatten(rightArray)
    wroteArray = flatten(wroteArray)
    const { chunkArray, transform, correct } = getTransform()

    restoreCase(wroteArray, wrote)

    return {
      chunkArray
    , transform
    , error
    , correct
    }
  }


  const lookForSwaps = (rightList, wroteList, lss) => {
    const rightString = rightList[0]
    const wroteString = wroteList[0]
    const rightLength = rightString.length - 1 // -1 so we don't
    const wroteLength = wroteString.length - 1 // overrun with ii + 1
    let dontSplit = false

    if (rightLength && wroteLength) {
      for ( let ii = 0; ii < rightLength; ii += 1 ) {
        const ch1 = rightString[ii]
        const offset1 = wroteString.indexOf(ch1)

        if (offset1 < 0) {
          // No match, so no flipped pair, so move on

        } else {
          const ch2 = rightString[ii + 1]
          const offset2 = wroteString.indexOf(ch2)

          if (offset2 < 0) {
            // The second element of the pair is missing. No match.

          } else if (Math.abs(offset1 - offset2) === 1) {
            // We've found a swap. Split the strings into three
            splitStringAt(ch1+ch2, rightList, rightQueue)
            splitStringAt(ch2+ch1, wroteList, wroteQueue)

            // There may be more swaps further along, but they will
            // be treated in a subsequent iteration of the while
            // loop below
            dontSplit = true
            error = true
            break
          }
        }
      }
    }

    if (!dontSplit) {
      splitStrings(rightList, wroteList, lss)
    }
  }


  const splitStringAt = (chunk, array, queue) => {
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


  const splitStrings = (rightList, wroteList, lss) => {
    splitStringAt(lss, rightList, rightQueue)
    splitStringAt(lss, wroteList, wroteQueue)
  }


  const flatten = (array, flattened=[]) => {
    let item

    // "" is falsy, but we need to treat empty string items, so we
    // need a tricky `while` expression which will return true for
    // any array or string, even if it's empty, while at the same
    // time setting `item` to the value shifted from the array.
    // When the array is empty, item will take the value `undefined`
    // and the while expression will return false.

    while ((item = array.shift(), !!item || item === "")) {

      if (Array.isArray(item)) {
        item = flatten(item)
        item.forEach(entry => {
          flattened.push(entry)
        })

      } else {
        flattened.push(item)
      }
    }

    return flattened
  }


  const restoreCase = (array, original) => {
    let start = 0
    let end = 0

    array.forEach((chunk, index) => {
      end += chunk.length
      array[index] = original.substring(start, end)
      start = end
    })
  }


  const getTransformForAutoCorrect = (lastIndex, typeIndex) => {
    const transform = []

    wroteArray.forEach((wrote, index) => {
      const right    = rightArray[index]

      if (wrote.toLowerCase() === right) {
        transform.push(0)

      } else if (!wrote) {
        if (right && index !== lastIndex) {
          // Text is missing in the input...

          if (errorFree(transform) && index === typeIndex) {
            // ... but everything up to this point is correct
            incomplete = true
          }

          transform.push("add")
        } // else: both wrote and right are "", for the last ite

      } else if (!right) {
        transform.push("cut")

      } else {
        treatFix(wrote, right, transform)
      }
    })

    return transform
  }


  const getTransformForSubmission = (lastIndex, typeIndex) => {
    const transform = []

    rightArray.forEach((right, index) => {
      const wrote    = wroteArray[index]

      if (right.toLowerCase() === wrote) {
        transform.push(0)

      } else if (right) {
        if (!wrote) {
          if (index !== lastIndex) {
            // Text is missing in the input...
            if (errorFree(transform) && index === typeIndex) {
              // ... but everything up to this point is correct
              incomplete = true
            }
          }

          transform.push("cut")

        } else {
          treatFix(right, wrote, transform)
        }
      } else if (wrote) {
        // Don't show the unnecessary text, but do count it as wrong
        transform.push(-1)
      }
    })

    return transform
  }


  const errorFree = (transform) => (
    !transform.reduce((error, action) =>  (
      error + !!action
    ), 0)
  )


  const treatFix = (display, compare, transform) => {
    if ( compare[0] === display[1] && compare[1] === display[0] ) {
      transform.push("flip")

    } else {
      transform.push("fix")
    }
  }


  const getTransform = () => {
    const lastIndex = wroteArray.length
    const typeIndex = lastIndex - 1
    let correct = false
    let chunkArray
      , transform

    if (submission) { // initial parameter
      transform = getTransformForSubmission(lastIndex, typeIndex)
      chunkArray = rightArray
    } else {
      transform = getTransformForAutoCorrect(lastIndex, typeIndex)
      chunkArray = wroteArray
    }

    quantifyError(transform, chunkArray)

    if (!error) {
      correct = true

    } else if (incomplete) {
      error = false
    }

    return {
      chunkArray
    , transform
    , correct
    }
  }


  const quantifyError = (transform, chunkArray) => {
    error = transform.reduce((cumulator, action, index) => (
      cumulator + !!action * (chunkArray[index].length + 1)
      // cut/add may be length 0
    ), 0)
  }


  return getDelta()
}


window.clozeDelta = clozeDelta