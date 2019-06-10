const { getLiburnas } = require('./runner')

const {
	LIBURNAS_URL
} = process.env

module.exports = async (tahun) => {

  try{
		let liburnas = getLiburnas()

    liburnas.on('page', function(type, message){
			ty = type;
			msg = message;
		});
	
		let libArr = await liburnas.goto(`${LIBURNAS_URL}-${tahun}/`).evaluate(()=>{
			let libArr = []
			$($('.row.row-eq-height.libnas-content').html()).map((id, e)=>{

				let ket = $(e).find('strong > a').text()
				let lib = $(e).find('time.libnas-calendar-holiday-datemonth').text()
				if(lib.indexOf('-') > -1) {
					let libRange = lib.split('-')
					let start = Number(libRange[0].trim())
					let endArr = libRange[1].trim().split(' ')
					let tahun = endArr[2]
					let bulan = endArr[1]
					let end = Number(endArr[0])
					for (let i = start; i <= end; i++) {
						libArr.push({
							date: [i, bulan, tahun].join(' '),
							ket: ket,
							tahun: tahun
						})
					}
				} else if(lib){		
					libArr.push({
						date: lib,
						ket: ket,
						tahun: lib.split(' ')[2]
					})
				}
			})
			return libArr
		})
		await liburnas.end()
		return libArr
	}catch(err){
    console.log(err)
  }
}