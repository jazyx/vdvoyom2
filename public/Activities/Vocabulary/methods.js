// /**
//  * /public/activities/Vocabulary/methods.js
//  */



// import { Meteor } from 'meteor/meteor'
// import SimpleSchema from 'simpl-schema'

// import { collections } from '/imports/api/collections/mint'
// const { Fluency, Group } = collections



// export const addToFluency = {
//   name: 'vocabulary.addToFluency'

// , call(fluencyItemArray, callback) {
//     const options = {
//       returnStubValue: true
//     , throwStubExceptions: true
//     }

//     Meteor.apply(this.name, [fluencyItemArray], options, callback)
//   }

// , validate(fluencyItemArray) {
//     fluencyItemArray.forEach( item => {
//       new SimpleSchema({    
//           phrase_id:  { type: String }
//         , user_id:    { type: String }
//         , group_id:   { type: String }
//         , next_seen:  { type: Number }
//       }).validate(item)
//     })
//   }

// , run(fluencyItemArray) {
//     const fillers = {
//       times_seen: 0
//     , first_seen: 0
//     , last_seen:  0
//     , flops:      4
//     , score:      0
//     , collection: "Vocabulary"
//     , level:      "TODO"
//     }
//     fluencyItemArray.forEach( fluencyObject => {
//       fluencyObject = {...fluencyObject, ...fillers}
//       Fluency.insert(fluencyObject)
//     })
//   }
// }



// // To register a new method with Meteor's DDP system, add it here
// const methods = [
//   addToFluency
// ]

// methods.forEach(method => {
//   Meteor.methods({
//     [method.name]: function (args) {
//       method.validate.call(this, args)
//       return method.run.call(this, args)
//     }
//   })
// })