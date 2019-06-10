const Nightmare = require('nightmare');
require('nightmare-window-manager')(Nightmare);

const nightmare = require('nightmare-plus')
require('nightmare-real-mouse')(nightmare)

const puppeteer = require('puppeteer')

const getLiburnas = () => new Nightmare({
	show: false,
	transparent: false,
	frame: true,
	webPreferences: {
		partition: 'persist:liburnas',
		images: false
	}
})

const getPage = () => new nightmare({
	//show: true,
	webPreferences: {
		partition: 'persist: wa'
	}
})

const getBrowser = async () => await puppeteer.launch({
	//headless: false,
	//devtools: true,
	//userDataDir: './simpustmp',
})

module.exports = {
	getLiburnas,
	getPage,
	getBrowser
}

