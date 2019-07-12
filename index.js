require('dotenv').config()

const { schedule } = require('node-cron')

const moment = require('moment');

moment.locale('id')

const liburnasObserver = require('./logic/liburnas')

const waObserver = require('./scraper/waObserver')

console.log('first run')
console.log(moment().format('LLLL'))

//liburnasObserver(moment)

schedule('30 12 1 * *', liburnasObserver(moment))

;(async () => await waObserver())()