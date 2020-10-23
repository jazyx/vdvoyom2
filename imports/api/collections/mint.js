/**
 * ** DO NOT EDIT THIS SCRIPT **
 * IT IS GENERATED AUTOMATICALLY
 * EACH TIME THE SERVER RESTARTS
 *
 * MODIFY THIS FILE INSTEAD:
 * /server/minters/collections.js
 * **** **** ********** **** ****
 *
 * This script creates a MongoDB collection named after each of the
 * folders found at '/public/collections/'.
 *
 * The collections and publish queries exported here are
 * imported by './publisher.js', which publishes them all.
 */



import { Mongo } from 'meteor/mongo';
import { collections as adminCollections
       , publishQueries as adminQueries
       } from './admin'


const Cloze = new Mongo.Collection('cloze')
const Flash = new Mongo.Collection('flash')
const Match = new Mongo.Collection('match')
const Nim = new Mongo.Collection('nim')
const Puzzle = new Mongo.Collection('puzzle')
const Show = new Mongo.Collection('show')
const Spiral = new Mongo.Collection('spiral')
const Stories = new Mongo.Collection('stories')
const Vocabulary = new Mongo.Collection('vocabulary')


export const collections = {
  ...adminCollections
, Cloze
, Flash
, Match
, Nim
, Puzzle
, Show
, Spiral
, Stories
, Vocabulary
}


export const publishQueries = {
  ...adminQueries
, "Cloze": {}
, "Flash": {}
, "Match": {}
, "Nim": {}
, "Puzzle": {}
, "Show": {}
, "Spiral": {}
, "Stories": {}
, "Vocabulary": {}
}