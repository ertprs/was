const data_kunj = require('../db/_data_kunj')
const {getBrowser} = require('../scraper/runner')

const {
	SIMPUS_URL,
	SIMPUS_USER,
	SIMPUS_PWD
} = process.env

const { pols } = require('../config')

let unit = {}

pols.map( ({ id, nama}) => unit[id] = nama )

module.exports = async(tgl, poli, rm) => {
	//console.log(poli)
	rm.nama = rm.nama.trim()

	// console.log(JSON.stringify(rm))

	let dial = ''
	let terdaftar = ''

	async function getTerdaftar () {
		let terdaft = ''

		let res = await data_kunj(tgl.split('-').reverse().join('-'))

		if(res.length) for(let [i, r] of res.entries()) {
			let kun = {
				dateTime: r.tanggal,
				rm: r.patient_id,
				nik: r.nik,
				nama: r.nama,
				jk: r.sex_id == 1 ? 'L' : 'P',
				alamat: r.alamat,
				poli: unit[r.unit_id]
			}
			let kunnama = kun.nama.split(' ').join('')
			let rmnama = rm.nama.split(' ').join('')
			if(kun.rm.includes(rm.id.toUpperCase()), kunnama.includes(rmnama)){
				terdaft += `rekam medis ${rm.id.toUpperCase()} atas nama ${kun.nama} sudah terdaftar dgn no urut ${i+1}`
				return terdaft
			}
		}
		
		return terdaft
	}

	terdaftar += await getTerdaftar()

	if(terdaftar !== '') {
		//console.log(terdaftar)
		return terdaftar
	} else {
		// console.log('belum kedaftar')
		const browser = await getBrowser()

		const simpusPage = await browser.newPage()

		simpusPage.on('dialog', async dialog => {
			dial = `${dialog.message()}\n`
			console.log(`${new Date()} ${dialog.type()}`)
			if(dial !== '') console.log(`${new Date()} ${dial}`)
			if(dialog.type() === 'alert'){
				await dialog.dismiss()
			} else {
				await dialog.accept()
			}
	
		})
	
		await simpusPage.goto(SIMPUS_URL, {
			waitUntil: 'networkidle0'
		})
		let notLogin = await simpusPage.$('#UserUsername')
		if(notLogin) {
			await simpusPage.type('#UserUsername', SIMPUS_USER)
			await simpusPage.type('#UserPassword', SIMPUS_PWD)
			await simpusPage.click('input[type="submit"][value="LOGIN"]')
		}

		await simpusPage.goto(`${SIMPUS_URL}visits/add_registrasi`, {
			waitUntil: 'networkidle0'
		})
		
		await simpusPage.evaluate(tgl=> document.getElementById('tglDaftar').setAttribute('value', tgl), tgl)
		poli = poli.toLowerCase()

		let idPoli
		let bpjsPoliId
		pols.map( ( pol ) => {
			if( pol.alias && Array.isArray(pol.alias) && pol.alias.indexOf(poli) > -1 ) {
				idPoli = pol.id
				bpjsPoliId = pol.bpjs_id
			} 
		})

		if(!idPoli) {
			idPoli = '01'
		}

		if(!bpjsPoliId){
			bpjsPoliId = '001'
		}

		await simpusPage.click(`input.cb-unit-id[value='${idPoli}']`)

		await simpusPage.select('select#kdpoli', bpjsPoliId)

		console.log('will search')

		await simpusPage.type('#patient_id', rm.id)

		console.log('type id patient done')

		await simpusPage.click('#searchidbtn')

		let ada
		while(!ada){
			ada = await simpusPage.evaluate(id => {
				let el = document.querySelector(`td.radio_selector > input[value="${id}"]`)
				if(el) {
					el.click()
					return true
				}
				return false
			}, rm.id)
		}

		let cariBtn
		while(!cariBtn){
			cariBtn = await simpusPage.evaluate(() => {
				let btnArr = document.querySelectorAll('button.btn.btn-success')
				for(let btn of btnArr){
					if(btn.textContent.includes('PILIH')){
						btn.click()
						return true
					}
				}
				return false
			})
		}

		if(rm.no_kartu && rm.no_kartu.length == 13){
			console.log(`${new Date()} no kartu ${rm.no_kartu}`)
			let verified
			let inputed 
			while(!inputed || inputed.length !== 13) {
				inputed = await simpusPage.evaluate(()=> document.getElementById('noks').value)
			}

			let clicked = await simpusPage.evaluate(()=>{
				let a = document.getElementById('verifikasi_bpjs')
				if(a){
					a.click()
					return true
				}
				return false
			})
			//console.log(clicked)
			if(clicked){
				while(!verified){
					verified = await simpusPage.evaluate(()=>{
						let resp = document.getElementById('online_verification').value
						return resp
					})

					if(verified === 'NOT OK') {
						await simpusPage.evaluate(() => document.getElementById('sbmt').click())
						verified = false
					}					

					if(dial) {
						verified = true
					}
				}				

				if(dial) {
					terdaftar += `${dial}\n`
				}

			}
			
		}
		let verTL
		let verJK
		while(!verTL || !verJK ){
			verJK = await simpusPage.evaluate(() => document.getElementById('sex').value)
			verTL = await simpusPage.evaluate(() => document.getElementById('tgllahir').value)
		}

		let verJP = await simpusPage.evaluate(()=> document.getElementById('typepatient').value)
		if(!verJP.includes('0')) {
			await simpusPage.select('#jenispasien', '01')
		} 
		
		await simpusPage.evaluate(()=> document.getElementById('sbmt').click())

		let ajax = ''
		lanjut = false
		let save2 = false
		while(!lanjut){
	
			let terdaf = await getTerdaftar()
			if(terdaf !== ''){
				lanjut = true
				
			} 

			let ljtel = await simpusPage.evaluate(()=> document.getElementById('lanjut'))

			if(ljtel && !save2){
				console.log(`${new Date()} ${lanjut}`)
				await simpusPage.evaluate(() => document.getElementById('lanjut').click())
				save2 = true
			}

			if(dial && dial.includes('BPJS tidak dapat dilanjutkan')) {
				terdaftar += dial
				lanjut = true
			}

			if(dial && dial.includes('berhasil')) {
				lanjut = true
			}

			let display = await simpusPage.evaluate(()=>document.getElementById('loading1').style.display)
			if(display === 'none'){
				await simpusPage.evaluate(()=> document.getElementById('sbmt').click())
			} 

			let ajaxel = await simpusPage.evaluate(()=>document.getElementById('ajaxMsg'))
			if(ajaxel) {
				ajax = await simpusPage.evaluate(()=>document.getElementById('ajaxMsg').innerText)
				console.log(`${new Date()} ajax msg ${ajax}`)
				lanjut = true
			}

		}	
		await browser.close()
		terdaftar += await getTerdaftar()
		if(terdaftar !== ''){
			return terdaftar
		} else {
			return 'Maaf, ada kesalahan sistem, pendaftaran gagal. \nMohon ulangi beberapa saat lagi.'
		}
	}

}