const moment = require('moment')
moment.locale('id')

const { getLiburnasByThn } = require('./liburnas')

module.exports = tgl => {
	let thn = moment(tgl, 'YYYY-MM-DD').format('YYYY')
	let liburArr = getLiburnasByThn(thn)
	liburArr = liburArr.map(tgl=>moment(tgl, 'D MMMM YYYY').format('YYYY-MM-DD'))
	if(liburArr.indexOf(tgl) === -1){
		return true		
	}
	return false
}
