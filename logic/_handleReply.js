const moment = require('moment')
const cekDaftar = require('../db/_cekDaftar')
const daftar = require('./_daftar')
const cari = require('../db/_cari')
const libur = require('../db/_libur')
const config = require('../config')

moment.locale('id')

const { 
	pols,
	RM_REGEX
} = require('../config')


const poliArr = []

pols.map( ({ alias }) => {
	if(alias && Array.isArray(alias)) {
		alias.map( st => poliArr.push(st))
	}
})

const cariFunc = async (chatArr, result ) => {
	if(typeof result === 'undefined'){
		result = ''
	}
	let newParams = [...chatArr].map(e=> e.trim())

	let resultArr = await cari(chatArr)

	if(resultArr.length > 20){
		result += `Ditemukan ${resultArr.length} hasil${resultArr.length ? ':' : '.'}\n`
		result += `Mohon parameter pencarian dipersempit.\n`
		resultArr.length = 0
	}


	while(newParams.length && !resultArr.length) {
		let naParams = [...newParams]
		naParams = naParams.join('#')
		while(naParams.includes(' ')  && !resultArr.length) {
			naParams = naParams.split(' ')
			naParams.pop()
			naParams = naParams.join(' ')
			resultArr = await cari([...naParams.split('#')])
			if(resultArr.length) {
				result += `mencoba\n#cari#${naParams}\n`
				result += `Ditemukan ${resultArr.length} hasil${resultArr.length ? ':' : '.'}\n`
			}
		}

		let nbParams = [...newParams]

		for ( let [id, noParams] of newParams.entries()) { 
			if(!noParams.match(RM_REGEX)) {
				while(noParams.length > 6 && !resultArr.length) {
					noParams = noParams.slice(0, -1)
					nbParams[id] = noParams
					resultArr = await cari([...nbParams])
					if(resultArr.length) {
						result += `mencoba #cari#${nbParams.join('#')}\n`
						result += `Ditemukan ${resultArr.length} hasil${resultArr.length ? ':' : '.'}\n`
					}
				}
			}
		}
		
		let aParams = [...newParams]

		aParams.shift()
		while(aParams.length && !resultArr.length ) {
			for ( let [id, noParams] of aParams.entries()) {
				let cParams = [...aParams] 
				if(!noParams.match(RM_REGEX)) {
					while(noParams.length > 6 && !resultArr.length) {
						noParams = noParams.slice(0, -1)
						cParams[id] = noParams
						//console.log(cParams)
						resultArr = await cari([...cParams])
						if(resultArr.length) {
							result += `mencoba #cari#${cParams.join('#')}\n`
							result += `Ditemukan ${resultArr.length} hasil${resultArr.length ? ':' : '.'}\n`
						}
					}
				}
			}

			aParams.shift()
		}
		
		newParams.pop()
	}

	return {
		result,
		resultArr
	}

}

module.exports = async (chat) => {
	let chatArr = chat.split('#')
	chatArr.shift()
	let api = chatArr.shift()
	let result = ''
	switch(api){
		case 'tes':
			result = 'ok\n'
			return result

		case 'cek':
			if(!chatArr.length) {
				result = 'ok\n'
				return result
			} else {
				let hari = chatArr.shift()
				hari = hari.toLowerCase().replace(' ', '')
				//console.log(hari)
				let tgl
				switch(hari){
					case 'sekarang':
					case 'hari ini':
					case 'hariini':
						tgl = moment().add(0, 'd')
						break
					case 'besok':
					case 'besuk':
						tgl = moment().add(1, 'd')
						break
					case 'lusa':
						tgl = moment().add(2, 'd')
						break
					default:
						result = 'Hari periksa tidak sesuai referensi sistem.\nGunakan #besok, #besuk atau #lusa.'
						return result + '\n'
				}
				if(!result){
					tgll = tgl.format('YYYY-MM-DD')
					//console.log (moment(tgl).weekday() ) 
					if (moment(tgl).weekday() == 6) {
						result = `Pelayanan rawat jalan ${tgl.format('dddd, D-M-YYYY')} tutup.\n`
						return result + '\n'
					} else {
						let isMasuk = await libur(tgll)
						//console.log(isMasuk)
						if(!isMasuk) {
							return `Pelayanan rawat jalan ${tgl.format('dddd, D-M-YYYY')} tutup.\n`
						} else {
							result = await cekDaftar(tgl.format('DD-MM-YYYY'))
							return result + '\n'
						}
					}
				}
	
			}
			break
		case 'cari':

			let res = await cariFunc(chatArr)

			result = res.result
			let resultArr = res.resultArr

			if(resultArr.length < 20) {
				result += `Ditemukan ${resultArr.length} hasil${resultArr.length ? ':' : '.'}\n`

				for (let res of resultArr){
				result += `(${resultArr.indexOf(res) + 1}) `
					for (let prop in res){
						if(prop == 'sex_id'){
							(res[prop] == '1') ? result += `Laki-laki | ` : result += `Perempuan | `
						} else if(prop == 'village_id'){
							let village = config.village
							for( let v of village){
								if(res[prop] === v.id){
									result += `${v.des} | `
								}
							}
						} else if(prop == 'orchard_id') {
							result += `RW: ${res[prop].slice(-2)} | `
						} else if(prop == 'tgl_lahir') {
							result += `lahir: ${moment(res[prop]).locale('id').format('dddd, LL')} | `
							let umur = moment(res[prop]).locale('id').fromNow().split(' ').slice(0, 2).join(' ')
							if(umur == 'setahun yang'){
								umur = '1 tahun'
							}
							result += `${umur} | `
						} else {
							let a;
							let b = res[prop]
							switch(prop){
								case 'id':
									a = 'no rm';
									b = b.toUpperCase()
									break
								case 'no_kartu':
									a = 'no bpjs'
									break
								default:
									a = prop
									break
							}
							result += `${a}: ${b} | `
						}
					}
					result += '\n'
				}

			}
			return result
		case 'datfar':
		case 'daftar':
			let hari = chatArr.shift()
			hari = hari.toLowerCase().replace(' ', '')
			let tgl
			let dddd
			switch(hari){
				case 'sekarang':
				case 'hariini':
					tgl = moment().add(0, 'd')
					let jam = tgl.format('H')
					if(jam >= 8) {
						console.log(`${new Date()} request masuk jam: ${jam}`)
						result = 'Pendaftaran via whatsapp untuk hari ini ditutup pukul 08.00\n'
						return result
					}
					break

				case 'besok':
				case 'besuk':
					tgl = moment().add(1, 'd')
//					let jam = tgl.format('H')
//					if(jam >= 21) {
//						console.log(`${new Date()} request masuk jam: ${jam}`)
//						result = 'Pendaftaran via whatsapp untuk besok ditutup pukul 21.00\n'
//						return result
//					}
					break
				case 'lusa':
					tgl = moment().add(2, 'd')
					break
				default:
					result = 'Hari periksa tidak sesuai referensi sistem.\nGunakan #besok, #besuk atau #lusa.'
					return result + '\n'
			}
			if(!result){
				tgll = tgl.format('YYYY-MM-DD')
				dddd = tgl.format('dddd')

				if (tgl.weekday() == 6) {
					result = `Pelayanan rawat jalan ${tgl.format('dddd, D-M-YYYY')} tutup.\n`
					return result
				} else {
					let isMasuk = await libur(tgll)

					if(!isMasuk) {
						return `Pelayanan rawat jalan ${tgl.format('dddd, D-M-YYYY')} tutup.\n`
					} else {
						let poli = chatArr.shift().toLowerCase()
						if(poli.includes('poli')) {
							poli = poli.split('poli').join('')
						}
						poli = poli.trim()
						let ada = poliArr.filter(e => e == poli)
						if(ada.length){

							if(poli === 'tht' && tgl.weekday() !== 1 && tgl.weekday() !== 3) {
								return `poli tht hanya buka hari Selasa dan Kamis.\n`
							}

							if(poli === 'fisioterapi' && tgl.weekday() !== 4) {
								return `poli fisioterapi, hanya bisa daftar via WA untuk jadwal hari Jum'at.\n`
							}

							if(poli === 'imunisasi' && tgl.weekday() !== 1 ) {
								return `poli imunisasi hanya buka hari Selasa.\n`
							}
/*
							if(poli === 'imunisasi' && tgl.weekday() !== 3 && tgl.weekday() !== 0) {
								return `poli imunisasi hanya buka hari Senin dan Kamis.\n`
							}
*/
							if(poli === 'rujukan') {
								poli = 'umum'
							}

							let res = await cariFunc(chatArr)
							let rm = res.resultArr


							if(rm.length > 1) {
								let nama = [...new Set(rm.map(e=>e.nama))]
								let jk = [...new Set(rm.map(e=>e.sex_id))]
								let tglLhr = [...new Set(rm.map(e=>e.tgl_lahir))]
								if(nama.length !== 1 && jk.length !== 1 && tglLhr.length !== 1){
									return 'Ditemukan lebih dari 1 rekam medis, mohon perbaiki parameter pencarian.\n'
								}
								rm = rm.splice(rm.length-1, 1)
							} else if (!rm.length) {
								return `Tidak ditemukan rekam medis berdasarkan parameter tersebut.\n`
							} 

							let umurArr = moment(rm[0].tgl_lahir).locale('id').fromNow().split(' ').slice(0, 2)
							let umur = umurArr[0]
							if(umur == 'setahun'){
								umur = '1'
							} else if (umurArr[1] !== 'tahun') {
								umur = '1'
							}

							if((poli === 'mtbs'  && umur > 5)) {
								return `poli ${poli} hanya melayani balita kurang dari 5 tahun.\n`
							} else if (poli === 'imunisasi' && umur > 6 ) {
								return `poli ${poli} hanya melayani balita kurang dari 6 tahun.\n`
							} else if(poli === 'lansia' && umur < 60) {
								return `poli lansia hanya melayani pasien lanjut usia 60 tahun ke atas.\n`
							} else if(poli==='kia' && umur <= 5) {
								return `untuk pemeriksaan balita mohon ganti poli ke mtbs atau imunisasi.\n`								
							}

							//console.log(`${new Date()} ${JSON.stringify(rm[0])}`)
							
							tgld = tgl.format('DD-MM-YYYY')

							//console.log(`daftar ${hari} ${dddd} ${tgld} ${poli} ${rm[0]}`)
							
							result = await daftar(hari, dddd, tgld, poli, rm[0])

							result += `\nMohon kesediaannya untuk dapat mengisi form kepuasan pelanggan berikut:\n ${process.env.FORM_LINK}`
							
							return result + '\n'

						} else {
							result = `Parameter ketiga adalah nama poli.\nNama poli tidak sesuai referensi sistem.\nGunakan: ${poliArr.map(e=>`#${e},`).join(' ')}.`
							return result + '\n'
						}
					}

				}

			}
			break
	}
	return result + '\n'
}