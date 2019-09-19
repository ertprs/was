require('dotenv').config()

const sulla = require('../controllers/initializer')

const start = require('./starter')

sulla.create().then(async client => await start(client));
