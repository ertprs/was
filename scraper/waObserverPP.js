const MySQLEvents = require('@rodrigogs/mysql-events');

const getconn = require('../db/_mysqlconn')

const { getPagePP } = require('./runner')

const isJSONString = require('../logic/_isJSONString')

const evalWithMutationObserver = require('../inBrowserFunction/_evalMutation')
const chatFunc = require('../inBrowserFunction/_chatFunc')
const newChat = require('../logic/newChat')

let halt

const { connection } = getconn()

const instance = new MySQLEvents(connection, {
	startAtEnd: true,
	excludedSchemas: {
		mysql: true,
	},
});

module.exports = async () => {
  await instance.start()

  const page = await getPagePP()
  
  page.on('console', handleConsole)
  console.log('try goto')

  await page
  .goto('https://web.whatsapp.com/', {
    waitUntil: 'networkidle2',
    timeout: 0
  })

  await page.waitFor(3000);

  console.log('ready eval')


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

	instance.addTrigger({
		name: 'NEW_VISITS',
		expression: '*',//'simpus.visits',
		statement: MySQLEvents.STATEMENTS.ALL, //INSERT,
    onEvent: async (event) => { // You will receive the events here
			console.log(`new event => type: ${event.type}, table: ${event.table}`)
      if(event.type === 'INSERT' && event.table === 'visits' && event.affectedRows.length) {
				let after = event.affectedRows[0].after
				
				console.log(JSON.stringify(after))

				let tglDaftar = moment(after.tanggal).format('DD-MM-YYYY')
				let jam = moment().format('H')
				console.log(`${new Date()} new visits => tgl: ${tglDaftar}, jam: ${jam}`)
				if(tglDaftar === moment().format('DD-MM-YYYY') ) { //&& jam >= 8 ) {

					try {
						let res = await connect(`SELECT * FROM patients WHERE id = "${after.patient_id}"`)
						let re = res[0]
						let all = Object.assign({}, after, {
							visit_id: after.id
						}, re)
		
						if(all.no_hp.match(/^(08)([0-9]){1,12}$/)) {
							for(let prop in all){
								if(all[prop] === '' || !all[prop]){
									delete all[prop]
								}
							}

							//send wa here
							all.no_hp = `62${all.no_hp.substr(1)}`
							//console.log(JSON.stringify(all, null, 2));
							
							let name = all.nama
							let number = all.no_hp
							console.log(`kunj baru ${new Date()} => nama: ${name}, no hp: ${number}`)
						
							let text = `Terima kasih atas kunjungan ${name}, ke Puskesmas ${process.env.PUSKESMAS}.\n Mohon kesediaannya untuk dapat mengisi form kepuasan pelanggan berikut:\n ${process.env.FORM_LINK}\n`
						
							while(halt){
								await new Promise(resolve=>setTimeout(()=>resolve(), 1000))
							}
					
							halt = true
					
							await page
              .goto(`https://web.whatsapp.com/send?phone=${number}&text=${text}`, {
                waitUntil: 'networkidle2',
                timeout: 0
              })

              let numNotExists, canSend
						
							while (!canSend && !numNotExists) {
								numNotExists = await page.evaluate(() => {
									let a = document.querySelector('#app ._3RiLE[data-animate-modal-popup="true"] > .aymnx > ._2Vo52')
									if (a) {
										if (a.textContent !== '') {
											return a.textContent
										}
									}
									return false
								})



								canSend = await page.exists("#main > footer > .copyable-area")
								if (canSend) {
									await page.type('#main > footer > .copyable-area', '\u000d')
									//await page.click("#main > footer > ._3pkkz.copyable-area button._35EW6");
									console.log(`${new Date()} msg sent`)
									console.log(`${text}`)
								}
							}
					
							if (numNotExists) {
								console.log(`${new Date()} ${numNotExists}`)

								await page
								.click('._2eK7W._3PQ7V')
								//.on('console', handleConsole)
								//.refresh()

							}

							halt = false
					
							await page.evaluate(evalWithMutationObserver)
					
						} else {
							console.log(`${new Date()} tdk ada no hp`)
						}

					}catch(err){
						console.log(err)
					}

				}

			}
		},
	});

	instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
	instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);

  await page.evaluate(evalWithMutationObserver)

}