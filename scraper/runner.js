const path = require('path')
const { browserConfig } = require('../config');
const puppeteer = require('puppeteer');

const Nightmare = require('nightmare');

const tmpPath = path.resolve(__dirname, browserConfig.data_dir);

const headless = !browserConfig.window;


const getLiburnas = () => new Nightmare({
	show: false,
	transparent: false,
	frame: true,
	webPreferences: {
		partition: 'persist:liburnas',
		images: false
	}
})

const getPagePP = async () => {
	const browser = await puppeteer.launch({
		headless: headless,
		userDataDir: tmpPath,
		ignoreHTTPSErrors: true,
		args: [
			'--log-level=3', // fatal only
			//'--start-maximized',
			'--no-default-browser-check',
			'--disable-infobars',
			'--disable-web-security',
			'--disable-site-isolation-trials',
			'--no-experiments',
			'--ignore-gpu-blacklist',
			'--ignore-certificate-errors',
			'--ignore-certificate-errors-spki-list',
			'--disable-gpu',
			'--disable-extensions',
			'--disable-default-apps',
			'--enable-features=NetworkService',
			'--disable-setuid-sandbox',
			'--no-sandbox',
		]
	});

	const page = await browser.newPage();
	await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3641.0 Safari/537.36');

	await page.setRequestInterception(true);

	page.on('request', (request) => {
		request.continue();
	});

	return page
}

const getBrowser = async () => await puppeteer.launch({
//	headless: false
})

module.exports = {
	getLiburnas,
	getPagePP,
	getBrowser
}

