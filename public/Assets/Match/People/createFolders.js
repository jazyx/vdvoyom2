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

// - "aleksandr.nam@cei.lactalis.com"
//   "andrey.filippov@cei.lactalis.com"
//   "anton.feldt@cei.lactalis.com"
//   "anton.stupnikov@cei.lactalis.com"
// - "viktoriya.pernikova@cei.lactalis.com"
//   "vitaliy.moroz@cei.lactalis.com"
//   "Evgeniy.TROFIMOV@cei.lactalis.com"
// - "Ekaterina.KORNYUKHOVA@cei.lactalis.com"
//   "kirill.zimnukhov@cei.lactalis.com"
// - "Kseniya.ZHATIKOVA@cei.lactalis.com"
//   "leonid.shalukhin@cei.lactalis.com"
//   "Lyubov.KUTUZOVA@parmalat.ru"
// - "mikhail.mironov@cei.lactalis.com"
//   "Olga.OBUKHOVA@parmalat.ru"
//   "tatyana.demkina@cei.lactalis.com"
//   "Elvira.ROZOVA@cei.lactalis.com"
//   "Yuliya.APOLONNIK@parmalat.ru"

// andrey.filippov@cei.lactalis.com
// anton.feldt@cei.lactalis.com
// anton.stupnikov@cei.lactalis.com
// Elvira.ROZOVA@cei.lactalis.com
// Evgeniy.TROFIMOV@cei.lactalis.com
// kirill.zimnukhov@cei.lactalis.com
// leonid.shalukhin@cei.lactalis.com
// Lyubov.KUTUZOVA@parmalat.ru
// Olga.OBUKHOVA@parmalat.ru
// tatyana.demkina@cei.lactalis.com
// vitaliy.moroz@cei.lactalis.com
// Yuliya.APOLONNIK@parmalat.ru


// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=8196&user=Андрей
// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=2016&user=Антон
// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=5835&user=Антон
// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=9655&user=Виталий
// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=3475&user=Евгений
// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=7294&user=Кирилл
// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=1114&user=Леонид
// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=4934&user=Любовь
// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=8753&user=Ольга
// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=2573&user=Татьяна
// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=6393&user=Эльвира
// ?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=0213&user=Юлия

/*

localhost:3000/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=test&vo=ru&pin=8196&user=Андрей
localhost:3000/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=test&vo=ru&pin=0213&user=Юлия


localhost:3333/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=6393&user=Эльвира

*/