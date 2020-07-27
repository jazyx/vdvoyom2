import { Mongo } from 'meteor/mongo';

// Export collections individually: import { Name } from '...'
const Chat     = new Mongo.Collection('chat')
const User     = new Mongo.Collection('user')
const Group    = new Mongo.Collection('group')
const Fluency  = new Mongo.Collection('fluency')
const UIText   = new Mongo.Collection('uitext')
const Counters = new Mongo.Collection('counters')
const Teacher  = new Mongo.Collection('teacher')
const Activity = new Mongo.Collection('activity')


// Define the queries that will be used to publish these collections
// in the standard way
export const publishQueries = {
  Chat:      {}
, User:      {}
, Group:     {}
, Fluency:   {}
, UIText:    {}
, Counters:  {}
, Teacher:   { $or: [
                  { file: { $exists: false } }
                , { file: { $ne: "xxxx" } }
                ]
              }
, Activity: {}
}

// Export a collections map
export const collections = {
  Chat
, User
, Group
, Fluency
, UIText
, Counters
, Teacher
, Activity
}
