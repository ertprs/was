require('dotenv').config()

const { schedule } = require('node-cron')

const moment = require('moment');

moment.locale('id')

const liburnasObserver = require('./logic/liburnas')

const sulla = require('./controllers/initializer')

const start = require('./observer/starter')

sulla.create().then(async client => await start(client));

console.log('first run')
console.log(moment().format('LLLL'))

schedule('30 12 1 * *', liburnasObserver(moment))