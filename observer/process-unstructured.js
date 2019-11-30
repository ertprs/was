const { 
  RM_REGEX,
  BPJS_REGEX,
  NIK_REGEX,
  days,
  polArr,
} = require('../config')

module.exports = messageBody => {
  messageBody = messageBody.toLowerCase()
  let rawArr = messageBody.match(/\b\w+/g)

  let formattedArr = []

  if(rawArr.length){
    if (rawArr.indexOf('daftarin') > -1) {
      formattedArr.push('daftar')
    }
  
    if (rawArr.indexOf('daftar') > -1) {
      formattedArr.push('daftar')
    }
  }

  if (formattedArr.indexOf('daftar') > -1) {
    let hari
    for (let day of days) {
      if (messageBody.includes(day)) {
        hari = `${day}`
        break
      }
    }
    if (hari) {
      formattedArr.push(hari)
    }
    let poli

    for (let pol of polArr) {
      if (messageBody.includes(pol)) {
        poli = `${pol}`
        break
      }
    }

    if (poli) {
      formattedArr.push(poli)
    }
  }

  if(Array.isArray(rawArr)) rawArr.map(params => {
    if (params.match(new RegExp(RM_REGEX))) {
      formattedArr.push(params)
    } else if (params.match(new RegExp(BPJS_REGEX))) {
      formattedArr.push(params)
    } else if (params.match(new RegExp(NIK_REGEX))) {
      formattedArr.push(params)
    }
  })

  rawArr = rawArr.join(' ').split(formattedArr[formattedArr.length - 1])

  if (rawArr.length > 1) {
    formattedArr.push(rawArr[rawArr.length - 1].trim())
  }

  formattedText = `#${formattedArr.join('#')}`

  if ((formattedArr[0] === 'cari' && formattedArr.length > 1) || (formattedArr[0] === 'daftar' && formattedArr.length > 3)) {
    formattedArr.shift()
  }

  return formattedText

}