const handleReply = require('../logic/handleReply')

const {
  RM_REGEX,
  BPJS_REGEX,
  NIK_REGEX,
  days,
  pols,
} = require('../config')

const polArr = []
pols.map(({ alias }) => {
  if(alias && Array.isArray(alias) ){
    alias.map( e => polArr.push(e))
  }
})

module.exports = async (page, newChatText) => {
  let rawText = newChatText.content
  rawText = rawText.toLowerCase()
  let rawArr = rawText.match(/\b\w+/g)
  let formattedArr = []

  if(rawArr){
    if (rawArr.indexOf('daftarin') > -1) {
      formattedArr.push('daftar')
    }
  
  
    if (rawArr.indexOf('daftar') > -1) {
      formattedArr.push('daftar')
    }
  }


  //if (!formattedArr.length && rawArr.indexOf('cari') > -1) {
  //  formattedArr.push('cari')
  //}

  if (formattedArr.indexOf('daftar') > -1) {
    let hari
    for (let day of days) {
      if (rawText.includes(day)) {
        hari = `${day}`
        break
      }
    }
    if (hari) {
      formattedArr.push(hari)
    }
    let poli
    for (let pol of polArr) {
      if (rawText.includes(pol)) {
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

  let formattedText = `#${formattedArr.join('#')}`

  if ((formattedArr[0] === 'cari' && formattedArr.length > 1) || (formattedArr[0] === 'daftar' && formattedArr.length > 3)) {

    formattedArr.shift()
    newChatText.contentArr = formattedArr
    newChatText.content = formattedText
    try {
      await handleReply(page, newChatText)
    } catch (err) {
      console.error(`${new Date()} ${err}`)
    }

  }
}