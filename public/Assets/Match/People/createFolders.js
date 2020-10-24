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
// 
// Yuliya.APOLONNIK@parmalat.ru
// 




http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=8196&user=Андрей
http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=2016&user=Антон
http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=5835&user=Антон
http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=9655&user=Виталий
http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=3475&user=Евгений
http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=7294&user=Кирилл
http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=1114&user=Леонид
http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=4934&user=Любовь
http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=8753&user=Ольга
http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=2573&user=Татьяна
http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=6393&user=Эльвира
http://staging.jazyx.com/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=0213&user=Юлия

/*

localhost:3000/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=test&vo=ru&pin=8196&user=Андрей
localhost:3000/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=test&vo=ru&pin=0213&user=Юлия


localhost:3333/?join&ace&group=Lactalis&own=jn&lang=en-GB&path=Match&tag=people&vo=ru&pin=6393&user=Эльвира

*/




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


Антон Ступников anton.stupnikov@cei.lactalis.com
Эльвира Elvira.ROZOVA@cei.lactalis.com
Евгений Evgeniy.TROFIMOV@cei.lactalis.com
Леонид  leonid.shalukhin@cei.lactalis.com
Любовь  Lyubov.KUTUZOVA@parmalat.ru
Ольга   Olga.OBUKHOVA@parmalat.ru
Виталий vitaliy.moroz@cei.lactalis.com



Татьяна tatyana.demkina@cei.lactalis.com did send me two photos, but they were photos that she did not take herself. I am not sure if she understands what I wrote.

These photos should:

* Be photos that you took yourself
* Show a person
* Show a different person in each photo
* Be at least 800 x 800 pixels