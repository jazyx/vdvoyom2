/**
 * /imports/ui/login/launch/ReadFromStorage.js
 */



import { deleteFrom } from '/imports/tools/generic/utilities'
import Storage from '/imports/tools/generic/storage'



export default class ReadFromStorage {
  constructor( setPage ) {
    const storedData = Storage.get()

    const wanted = [
      "auto_login"
    , "restore_all"
    , "user"
    // , "user_id"
    , "vo"
    , "own"
    // , "language"
    // , "group_id"
    // , "group" // group name
    , "pin"
    , "page" // { view: <>, path: <>, tag: <>, index: <> }
    , "data"
    ]

    const deleteUnwanted = ( key, value ) => {
      if (wanted.indexOf(key) < 0) {
        return true
      } else if (value === undefined || value === null) {
        return true
      }

      return false
    }

    deleteFrom(storedData, deleteUnwanted)

    return storedData
  }
}