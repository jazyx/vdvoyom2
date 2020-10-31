/**
 * /tests/randoms.js
 */


import { getRandom
       , getRandomFromArray
       } from '../imports/tools/generic/utilities.js'


export const random_id = ({ length=17, noNumbers=false, hex=false }) => {
  let string = hex
             ? "0123456789abcdef"
             : "ABDEFGHIJKLMNOPQRSTUVWXYZ"
             + "abdefghijklmnopqrstuvwxyz"
  if (!hex && !noNumbers) {
    string += "0123456789"
  }
  let id = ""
  for ( let ii = 0; ii < length; ii += 1 ) {
    id += getRandomFromArray(string)
  }

  return id
}


export const random_lang = () => {
  let lower = "abdefghijklmnopqrstuvwxyz"
  let UPPER = "ABDEFGHIJKLMNOPQRSTUVWXYZ"
  let dialect = getRandom(1)



  let lang = getRandomFromArray(lower) + getRandomFromArray(lower)
  if (dialect) {
    lang += "-" +getRandomFromArray(UPPER) + getRandomFromArray(UPPER)
  }

  return lang
}


export const random_name = () => {
  let name       = ""
  let vowels     = "aeiouy"
  let consonants = "bcdfghjklmnpqrstvwxz"
  let length     = getRandom(8, 3)
  let useVowel   = getRandom(1)

  for ( let ii = 0; ii < length; ii += 1 ) {
    if (useVowel = !useVowel) {
      name += getRandomFromArray(vowels)
    } else {
      name += getRandomFromArray(consonants)
    }
  }

  return name[0].toUpperCase() + name.substring(1)
}


export const get_cyrillic = (name) => {
  name = name.toLowerCase()
  const latin    = "abcdefghijklmnopqrstuvwxyz"
  const cyrillic = "абцдефгхийклмнопчрстувшщыз"
  const length   = name.length
  let имя = ""

  for ( let ii = 0; ii < length; ii += 1 ) {
    имя += cyrillic[latin.indexOf(name.charAt(ii))]
  }

  return имя[0].toUpperCase() + имя.substring(1)
}


export const random_file = (name) => {
  let extension = getRandomFromArray([".jpg", ".png", ".gif", ",svg"])

  return name + extension
}


export const lorem_ipsum = (length) => {
  const lorem_ipsum = "sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem ut enim ad minima veniam quis nostrum exercitationem ullam corporis suscipit laboriosam nisi ut aliquid ex ea commodi consequatur quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur vel illum qui dolorem eum fugiat quo voluptas nulla pariatur"
  const words = lorem_ipsum.split(" ")
  const start = getRandom(words.length - length)
  let output = words.slice(start, start+length).join(" ")

  return output[0].toUpperCase() + output.substring(1)
}


export const random_teacher = ({ teacher, language }) => {
  const latn = random_name()
  const cyrl = get_cyrillic(latn)

  return {
    "_id"  : random_id({})
  , "file" : random_file(teacher)
  ,  "id"  : teacher
  , "name" : {
      cyrl
    , latn
    }
  , "with" : lorem_ipsum(getRandom(6,2))
  , language
  , "script" : ["cyrl", "latn"][getRandom(1)]
  , "type" : "profile"
  , "version" : getRandom(20)
  , "logged_in" : []


  }
}


export { getRandom }