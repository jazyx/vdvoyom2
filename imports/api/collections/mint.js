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


const Show = new Mongo.Collection('show')


export const collections = {
  ...adminCollections
, Show
}


export const publishQueries = {
  ...adminQueries
, "Show": {}
}