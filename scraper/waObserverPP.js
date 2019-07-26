const { getPagePP } = require('./runner')

const reply = require('../logic/_handleReply')

const evalWithMutationObserver = require('../inBrowserFunction/_evalMutation')
const chatFunc = require('../inBrowserFunction/_chatFunc')
const mainChatFunc = require('../inBrowserFunction/_mainChatFunc')

const isJSONString = str => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

const {
  mainChatSel, 
  RM_REGEX,
  BPJS_REGEX,
  NIK_REGEX,
  days,
  pols,
  keywords
} = require('../config')


let halt

const handleReply = async (page, newChatText) => {
  console.log(`${new Date()} replying ${newChatText.user} ${newChatText.content}`)
  try {
    newChatText.reply = await reply(newChatText.content)
    let nc = newChatText
    delete nc.selector
    nc = JSON.stringify(nc)

    //await page.insert('#side > div._3CPl4 > div > label > input', newChatText.user)
    //await page.type('#side > div._3CPl4 > div > label > input', '\u000d')

    await page.type('#main > footer > .copyable-area', newChatText.reply)
    await page.type('#main > footer > .copyable-area', '\u000d')
    console.log(`${new Date()} ${newChatText.reply}`)

  } catch (err) {
    console.log(`${new Date()} ${err}`)
  }
}

const handleUnstructured = async (page, newChatText) => {
  let rawText = newChatText.content
  rawText = rawText.toLowerCase()
  let rawArr = rawText.match(/\b\w+/g)
  let formattedArr = []

  if (rawArr.indexOf('daftarin') > -1) {
    formattedArr.push('daftar')
  }


  if (rawArr.indexOf('daftar') > -1) {
    formattedArr.push('daftar')
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
    for (let pol of pols) {
      if (rawText.includes(pol)) {
        poli = `${pol}`
        break
      }
    }
    if (poli) {
      formattedArr.push(poli)
    }
  }

  rawArr.map(params => {
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
      console.log(`${new Date()} ${err}`)
    }

  }
}



const newChat = async (page, chat) => {
  console.log(`${new Date()} handle new chat`)
  let mainChatElArr = []
  let newMainChatElArr = []
  while (mainChatElArr.length < Number(chat.newNotif)) {
    mainChatElArr = await page.evaluate(mainChatFunc, mainChatSel)
    if (!Array.isArray(mainChatElArr)) {
      mainChatElArr = []
    }
  }
  while (newMainChatElArr.length < Number(chat.newNotif)) {
    let newChatText = mainChatElArr.pop()

    newMainChatElArr.push(newChatText)
  }
  for (let newChatText of newMainChatElArr) {
    //if (chat.isGroup) {
     // newChatText.group = chat.group
    //}
    newChatText.user = chat.user
    let containsPandawa = newChatText.content && newChatText.content.toLowerCase().includes('pandawa')
    let isTag = newChatText.content && newChatText.content.charAt(0) == '#' ? true : false
    let contentArr = []

    try {
      if (containsPandawa) {
        await page.type('#main > footer > .copyable-area', 'Harap mengganti kata pandawa dengan nama pasien.')
        await page.type('#main > footer > .copyable-area', '\u000d')

      } else {
        if (isTag) {

          if (newChatText.content.includes('alamat')) {
            newChatText.content = newChatText.content.split('alamat').join('#')
          }

          if (newChatText.content.includes('.')) {
            newChatText.content = newChatText.content.split('.').join('')
          }

          while (newChatText.content.includes('##')) {
            newChatText.content = newChatText.content.split('##').join('#')
          }

          contentArr = newChatText.content.split('#')
          contentArr = contentArr.map(e => e.trim())
          contentArr.shift()
          let firstWord = contentArr.shift()
          firstWord = firstWord.split(' ').join('')
          let isKeyword = keywords.filter(e => {
            if (firstWord == e) {
              return true
            }
            return false
          })
          if (isKeyword.length) {
            newChatText.contentArr = contentArr
            await handleReply(page, newChatText)
          } else {
            await handleUnstructured(page, newChatText)
          }
        } else {
          await handleUnstructured(page, newChatText)
        }

      }

    } catch (err) {
      console.log(`${new Date()} ${err}`)
    }

  }
}


;(async () => {
  const page = await getPagePP()
  
  page.on('console', handleConsole)
  console.log('try goto')
  await page.goto('https://web.whatsapp.com/', {
    waitUntil: 'networkidle2',
    timeout: 0
  })

  await page.waitFor(3000);

  console.log('ready eval')

  await page.evaluate(evalWithMutationObserver)

  async function handleConsole(message) {
    let mutation = message._text

    //console.log(mutation)
    
    if (isJSONString(mutation)) {
      mutation = JSON.parse(mutation)
      //if (mutation.type === 'childList' && mutation.selector.includes('._15G96')) {
      if (mutation.type === 'childList' && mutation.selector.includes('.P6z4j')) {
        console.log(`${new Date()} mutation`)
        //let clickSel = `${mutation.selector.split(' > ._2EXPL.CxUIE')[0]}`
        let clickSel = `${mutation.selector.split(' > ._2UaNq')[0]}`

        try {

          await page.waitForSelector(clickSel)

          let chat = {
            newNotif: false,
            user: false
          }

          while (!chat.newNotif && !chat.user) {
            chat = await page.evaluate(chatFunc, clickSel)
          }

          let msg = Object.assign({}, chat)
          if (msg && msg !== null && msg.user) {
            console.log(`${new Date()} new msg`)

            while (halt) {
              await new Promise(resolve => setTimeout(() => resolve(), 1000))
            }
            halt = true

            await page.type('#side > div._2HS9r > div > label > input', msg.user)
            //await page.insert('#side > div._3CPl4 > div > label > input', msg.user)
            //await page.type('#side > div._3CPl4 > div > label > input', '\u000d')
            await page.type('#side > div._2HS9r > div > label > input', '\u000d')
            await newChat(page, chat)
            halt = false

          }

        } catch (err) {
          throw(err)
        }

      }

    }
       

  }


})()