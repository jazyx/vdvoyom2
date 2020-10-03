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