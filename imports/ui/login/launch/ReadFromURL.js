
/**
 * /imports/ui/login/launch/ReadFromURL.js
 *
 * Reads data from the URL and returns it as an object.
 * 
 * Use:
 *
 *   const params = new ReadFromURL()
 *   
 * Note: the call returns an object, not an instance of the class.
 * 
 * 
 * The URL has the following format:
 * 
 *   https://sub.domain.com/shortcut?flag&key=value
 *   
 *   shortcut: This should be an _id for a doc in the Shortcut
 *             collection. It may represent a complete query
 *             (flag&key=value) or just the name of a school which
 *             should be used to select which teachers are shown
 *             (?school=name)
 *             Data retrieved from the Shortcut have lower priority
 *             than data provided by explicit flags or keys.
 *             Shortcuts cannot be read until the Shortcut collection
 *             is available, so this low-priority data source is in
 *             fact the last to be used.
 *   
 *   flag:     Flags are keys with no corresponding value. If present
 *             their value is considered to be true, if absent: false.
 *             
 *             Expected flags:
 *             
 *             anon:  creates temporary User and Group documents
 *                    which are destroyed when the session ends.
 *                    Visitor has no access to a teacher or other
 *                    users
 *             pass:  creates temporary anon User and Group documents
 *                    IF no account is available for auto_login on
 *                    this device. If an account IS available, it will
 *                    be used instead.
 *             join:
 *             staff: 
 *             admin:
 *             
 *             If a value other than "true" is given to a key with 
 *             one of these flags, the value "true" will override the
 *             value.  
 * 
 *   key:      The following values can be set, taking priority over
 *             all other sources for these values¹:
 *             
 *             user  - User.name
 *             pin   - User.pin
 *             vo    - User.native
 *             group - Group.name
 *             own   - Teacher | Group.owner
 *             lang  - Teacher. | Group.language
 *             path  - Collection | /Activity/folder/choice 
 *             index - initial index into path
 *             tag   - tag for records in Collection
 *             
 *             [data]- all other key/value pairs are assembled into a
 *                     one-level data object 
 *
 *             ¹ If the "anon" flag is set, group and pin will be
 *               ignored
 *               
 * The URL may return all the data needed to launch the app, or it may
 * provide nothing at all. Gaps in the data may be filled from:
 * 
 * = Local Storage
 * = Input from the user, via the Profile pages, with default values
 * 
 * Local Storage can be read before the MongoDB collections become
 * available to the client. The getQueryData() method will not be
 * called until the MongoDB collections are available.
 */



import collections from '/imports/api/collections/publisher'
const { Shortcut } = collections



export default class ReadFromURL {
  constructor() {
    const location = window.location
    const pathName = location.pathname
    const search   = location.search

    this.booleanKeys = [
      "join"
    , "anon"
    , "pass"
    , "ace"
    , "staff"
    , "admin"
    ]

    const shortcut = this.readShortcutFrom(pathName)
    let params     = this.getQueryData(search)

    params         = Object.assign(shortcut, params)

    return params
  }


  /** Returns an object with values read from the Shortcut collection
   *  based on the "folder" items in the URL pathname
   *
   * The URL has the format https://sub.domain.tld/path/name?search
   * Each item in the `path/name` section can be an independent
   * shortcut. For example...
   * 
   *   schoolX/pageY
   *   
   * ... might evoke shortcuts for:
   * 
   *   ?school=bestSchoolEver&lang=en-GB   // en-GB will be
   *   ?page=Activity&tag=task&lang=fr     // overwritten by fr
   *   
   * Normally, each shortcut will add new information, but if a param
   * with a different value appears again in a later shortcut (such
   * as `lang=fr` in the example above), its value will overwrite 
   * earlier values. 
   */
  readShortcutFrom(pathName) {
    const options = {
      fields: {
        query: 1
      }
    }

    const getQueryFromShortcut = _id => {
      /// <<< HACK to convert Russian а to Latin a for Настя
      _id = decodeURI(_id)
            .replace(/^аа$/i, "aa")
      /// HACK >>>

      const { query } = Shortcut.findOne({ _id }, options) || {}
      return query    
    }

    const shortcut = pathName.split("/")
                             .filter( item => !!item )
                             .map(getQueryFromShortcut)
                             .filter( object => !!object )
                             .map( query => this.getQueryData(query) )
                             .reduce(( cumul, object ) => {
                               Object.assign(cumul, object)
                               return cumul
                             }, {})
    return shortcut
  }


  getQueryData(search) {
    const data = {}
    const query = new URLSearchParams(search)

    query.forEach(( value, key ) => {
      if (value) { // ignore empty strings such as tag=&group=
        data[key] = value
      }
    })

    // Make Boolean keys explicitly true or false, if present
    // "true" => true; "false" => false; <missing> => not defined
    // This allows us to distinguish `key === false` from a missing
    // key.
    this.booleanKeys.forEach( key => {
      if (query.has(key)) {
        data[key] = (data[key] !== "false")
      }
    })

    return data
  }
}
