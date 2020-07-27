/**
 * /imports/api/methods/assets/log.js
 *
 * A singleton Log instance is instantiated by ./import.js
 * ImportAssets and passed to each instance that it creates.
 *
 * Use:
 *
 *   const logger = new Log()
 *   this.log = logger.addEntry
 *   ...
 *   this.log(message)
 *   ...
 *   logger.save()
 */



export default class Log{
  constructor() {
    this.logSheet = ""
    this.addEntry = this.addEntry.bind(this)
    this.save = this.save.bind(this)
  }

  addEntry(message) {
    this.logSheet += "\n" + message
  }

  save() {
    //console.log( "LOG", this.logSheet + "\n~~~~~~~~~~~~~~~~~~")
  }
}