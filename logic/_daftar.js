//const libur = require('./libur')
const simpus = require('./_simpus')
module.exports = async (hari, dddd, tgl, poli, rm) =>{
	let result = await simpus(tgl, poli, rm)
	if(hari === 'hariini'){
		hari = 'hari ini'
	}
	if(result.includes('atas nama')) {
		return `${result}, ${hari}, ${dddd}, ${tgl} di poli tujuan ${poli.toUpperCase()}. \nSilahkan konfirmasi dengan loket pd hari kunjungan untuk mendapatkan nomor antrian poli tujuan.\n`
	}
	return `${result}`
}