const { getLiburnasByThn, addLiburnas } = require('../db/liburnas')

const getLiburnasScraper = require('../scraper/getLiburnas')

module.exports = async moment => {
  console.log('cek hari libur nasional')
  console.log(moment().format('LLLL'))

  let tahun = moment().get('year')

  tahun = tahun.toString()

  liburnas = getLiburnasByThn(tahun)

  if (!liburnas || !liburnas.length) {
    liburnas = [...await getLiburnasScraper(tahun)].map(e => Object.assign({}, e, {
      id: moment(e.date, 'D MMMM YYYY').format('YYYYMMDD')
    }))

    for (let l of liburnas) {
      addLiburnas(l)
    }

  }

 // console.log(liburnas)

}
