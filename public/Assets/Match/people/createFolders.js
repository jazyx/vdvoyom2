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


// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=8196&user=Андрей
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=2016&user=Антон
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=5835&user=Антон
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=9655&user=Виталий
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=3475&user=Евгений
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=7294&user=Екатерина
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=1114&user=Кирилл
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=4934&user=Леонид
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=8753&user=Любовь
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=2573&user=Ольга
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=6393&user=Татьяна
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=0213&user=Эльвира
// ?join&group=lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=4032&user=Юлия
