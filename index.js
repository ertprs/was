require('dotenv').config()

const { schedule } = require('node-cron')

const moment = require('moment');

moment.locale('id')

const { getLiburnasByThn, addLiburnas } = require('./db/liburnas')

const getLiburnasScraper = require('./scraper/getLiburnas')

const main = async () => {
  console.log('cek hari libur nasional')
  console.log(moment().format('LLLL'))

  let tahun = moment().get('year')

  tahun = tahun.toString()

  liburnas = getLiburnasByThn(tahun)

 // if(!liburnas.length) {
    liburnas = [...await getLiburnasScraper(tahun)].map(e => Object.assign({}, e, {
      id: moment(e.date, 'D MMMM YYYY').format('YYYYMMDD')
    }))

    for(let l of liburnas){
      addLiburnas(l)
    }

//  }

  console.log(liburnas)

}

console.log('first run')
console.log(moment().format('LLLL'))

//main()

schedule('30 21 1 * *', main)