/**
 * /public/Activities/Cloze/deck/clozeComponent.js
 */



import React, { Component } from 'react';

import { Add
       , Cut
       , Fix
       , Flip
       } from './inputs'



export const clozeComponent = ({ chunkArray, transform }) => {

  const cloze = chunkArray.map(( chunk, index ) => {
    const key = index + chunk
    const hasSpace = chunk.includes(" ")
    const action = transform[index]

    switch (action) {
      case 0:
        // No span for "" at start or end
        return (chunk) ? <span key={key}>{chunk}</span> : ""
      case "fix":
        return <Fix  key={key} has_space={hasSpace}>{chunk}</Fix>
      case "flip":
        return <Flip key={key} has_space={hasSpace}>{chunk}</Flip>
      case "cut":
        return <Cut  key={key} has_space={hasSpace}>{chunk}</Cut>
      case "add":
        return <Add  key={key} has_space={hasSpace} />
      default:
        // User added unnecessary text for submission
        return ""

      // case 0:
      //   // No span for "" at start or end
      //   return (chunk) ? `<span key="${key}">${chunk}</span>` : ""
      // case "fix":
      //   return `<Fix  key="${key}" has_space=${hasSpace}>${chunk}</Fix>`
      // case "flip":
      //   return `<Flip key="${key}" has_space=${hasSpace}>${chunk}</Flip>`
      // case "cut":
      //   return `<Cut  key="${key}" has_space=${hasSpace}>${chunk}</Cut>`
      // case "add":
      //   return `<Add  key="${key}" has_space=${hasSpace} />`
    }
  }).filter(item => !!item) // remove "" at beginning or end


  return cloze
}


window.clozeComponent = clozeComponent