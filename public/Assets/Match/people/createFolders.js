"use strict"

// console.log(process.argv)


const fs = require('fs')
const path = require('path')

const createFolders = () => {
  const path = __dirname
  const names = [
    "Александр"
  , "Андрей"
  , "Антон_Фелдт"
  , "Антон_Ступников"
  , "Виктонрия"
  , "Виталий"
  , "Евгений"
  , "Екатерина"
  , "Кирилл"
  , "Ксения"
  , "Леонид"
  , "Любовь"
  , "Михаил"
  , "Ольга"
  , "Татьяна"
  , "Эльвира"
  , "Юлия"
  , "James"
  ]

  names.forEach( name => {
    const folderPath = path + "/" + name
    if (!fs.existsSync(folderPath)) {
      // console.log(folderPath)
      fs.mkdirSync(folderPath)
    }
  })
}

createFolders()









  // [ "aleksandr.nam@cei.lactalis.com"
  // , "andrey.filippov@cei.lactalis.com"
  // , "anton.feldt@cei.lactalis.com"
  // , "anton.stupnikov@cei.lactalis.com"
  // , "viktoriya.pernikova@cei.lactalis.com"
  // , "vitaliy.moroz@cei.lactalis.com"
  // , "Evgeniy.TROFIMOV@cei.lactalis.com"
  // , "Ekaterina.KORNYUKHOVA@cei.lactalis.com"
  // , "kirill.zimnukhov@cei.lactalis.com"
  // , "Kseniya.ZHATIKOVA@cei.lactalis.com"
  // , "leonid.shalukhin@cei.lactalis.com"
  // , "Lyubov.KUTUZOVA@parmalat.ru"
  // , "mikhail.mironov@cei.lactalis.com"
  // , "Olga.OBUKHOVA@parmalat.ru"
  // , "tatyana.demkina@cei.lactalis.com"
  // , "Elvira.ROZOVA@cei.lactalis.com"
  // , "Yuliya.APOLONNIK@parmalat.ru"
  // ]


// andrey.filippov@cei.lactalis.com
// anton.feldt@cei.lactalis.com
// anton.stupnikov@cei.lactalis.com
// Ekaterina.KORNYUKHOVA@cei.lactalis.com
// Elvira.ROZOVA@cei.lactalis.com
// Evgeniy.TROFIMOV@cei.lactalis.com
// kirill.zimnukhov@cei.lactalis.com
// leonid.shalukhin@cei.lactalis.com
// Lyubov.KUTUZOVA@parmalat.ru
// Olga.OBUKHOVA@parmalat.ru
// tatyana.demkina@cei.lactalis.com
// vitaliy.moroz@cei.lactalis.com
// Yuliya.APOLONNIK@parmalat.ru


// ?join&user=Андрей&own=jn&pin=8196&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Антон&own=jn&pin=2016&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Антон&own=jn&pin=5835&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Виталий&own=jn&pin=9655&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Евгений&own=jn&pin=3475&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Екатерина&own=jn&pin=7294&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Кирилл&own=jn&pin=1114&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Леонид&own=jn&pin=4934&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Любовь&own=jn&pin=8753&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Ольга&own=jn&pin=2573&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Татьяна&own=jn&pin=6393&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Эльвира&own=jn&pin=0213&vo=ru&lang=en-GB&path=Match&tag=people
// ?join&user=Юлия&own=jn&pin=4032&vo=ru&lang=en-GB&path=Match&tag=people