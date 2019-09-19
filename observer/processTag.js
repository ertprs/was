const { 
  RM_REGEX,
  BPJS_REGEX,
  NIK_REGEX,
  days,
  polArr,
  keywords 
} = require('../config')


module.exports = (messageBody) => {

  let contentArr = []
  let formattedText
  let formattedArr = []

  if (messageBody.includes('alamat')) {
    messageBody = messageBody.split('alamat').join('#')
  }

  if (messageBody.includes('.')) {
    messageBody = messageBody.split('.').join('')
  }

  while (messageBody.includes('##')) {
    messageBody = messageBody.split('##').join('#')
  }

  contentArr = messageBody.split('#')
  contentArr = contentArr.map(e => e.trim())
  contentArr.shift()
  
  let firstWord = contentArr.shift()
  
  if(firstWord){
    firstWord = firstWord.split(' ').join('')
  }
  
  let isKeyword = keywords.filter(e => {
    if (firstWord == e) {
      return true
    }
    return false
  })

  if(!isKeyword.length){

    messageBody = messageBody.toLowerCase()
    let rawArr = messageBody.match(/\b\w+/g)
  
    if(rawArr){
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
      if (params.match(RM_REGEX)) {
        formattedArr.push(params)
      } else if (params.match(BPJS_REGEX)) {
        formattedArr.push(params)
      } else if (params.match(NIK_REGEX)) {
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
  
  } else {
    formattedText = messageBody
  }

  return formattedText

}