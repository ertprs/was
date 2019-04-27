const Nightmare = require('nightmare');

require('nightmare-window-manager')(Nightmare);

module.exports = {
	getLiburnas,
}

function getLiburnas(){
	return new Nightmare({
		show: false,
		transparent: false,
		frame: true,
		webPreferences:{
			partition: 'persist:liburnas',
			images: false
		}
	})
}
