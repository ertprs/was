const puppeteerConfig = require('./puppeteer')
const browserConfig = require('./browser')
const regexConfig = require('./regex')
const selectorConfig = require('./selector')
const simpusConfig = require('./simpus')

const polArr = []
simpusConfig.pols.map(({ alias }) => {
  if(alias && Array.isArray(alias) ){
    alias.map( e => polArr.push(e))
  }
})

module.exports = Object.assign({}, 
  { 
    polArr, 
    puppeteerConfig, 
    browserConfig 
  }, 
  regexConfig, 
  selectorConfig, 
  simpusConfig
)