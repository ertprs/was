const { getPagePP } = require('./runner')

const isJSONString = require('../logic/_isJSONString')

const evalWithMutationObserver = require('../inBrowserFunction/_evalMutation')
const chatFunc = require('../inBrowserFunction/_chatFunc')
const newChat = require('../logic/newChat')

let halt

module.exports = async () => {
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
       // console.log(`${new Date()} mutation`)
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


}