const moment = require('moment')
moment.locale('id')

const getPatient = require('./getPatient')

const processTag = require('./processTag')

const getInstance = require('./getInstance')

const generateReply = require('./generateReply')

module.exports = async client => {
  const {
    instance,
    MySQLEvents
  } = await getInstance()

  // let chats = await client.getAllChats(true)

  // console.log(chats)

  client.onMessage(async message => {

    // console.log(message)
    if(message.type === 'chat' && !message.isGroupMsg && !message.isMMS && !message.isMedia && message.chatId !== 'status@broadcast') {

      console.log(`pesan baru dari: ${message.sender.name}, chat id: ${message.chat.id}, isi: ${message.body}`)

      let messageBody = message.body
      let containsPandawa = messageBody && messageBody.toLowerCase().includes('pandawa')
     // let isTag = messageBody && messageBody.charAt(0) == '#' ? true : false

      if(containsPandawa){
        await client.sendText(message.chat.id, 'Harap mengganti kata pandawa dengan nama pasien.')
      } else {
        // if is tag
       // if(isTag){
        text = processTag(messageBody)
        await generateReply(client, {
          user: message.from,
          content: text
        })
        //}
      }
    }

  });

  instance.addTrigger({
    name: 'NEW_VISITS',
    expression: 'simpus.visits',
    statement: MySQLEvents.STATEMENTS.ALL, //INSERT,
    onEvent: async (event) => { // You will receive the events here
     // console.log(`event: ${JSON.stringify(event)}`)
//      await instanceEvent(event, client)
      let tglDaftar = moment(event.timestamp, 'x').format('DD-MM-YYYY')

      let patient = await getPatient(event)

    //  console.log(JSON.stringify(patient))

      if( event.type === 'INSERT' /* && event.table === 'visits'*/ ) {

        if(tglDaftar === moment().format('DD-MM-YYYY')){//} && jam >= 8 ) {

          if(patient && patient.no_hp && patient.no_hp.match(/^(08)([0-9]){1,12}$/)) {

            //send wa here
            patient.no_hp = `62${patient.no_hp.substr(1)}`

            let name = patient.nama
            console.log(`data pasien: ${JSON.stringify(patient)}`)

            let text = `Terima kasih atas kunjungan ${name}, ke Puskesmas ${process.env.PUSKESMAS}.\n Mohon kesediaannya untuk dapat mengisi form kepuasan pelanggan berikut:\n ${process.env.FORM_LINK}\n`

            let from = `${patient.no_hp}@c.us`

            try{
              await client.sendText( from, text)
              console.log(`send text to: ${from}, isi: ${text}`)
            } catch (err) {
              console.error(`${tglDaftar} jam ${moment(event.timestamp, 'x').format('H')} send text error: ${JSON.stringify(err)}`)
            }

          }

        }

      }

    },
  });

  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, err => console.error(`${new Date()}: ${JSON.stringify(err)}`));
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, err => console.error(`${new Date()}: ${JSON.stringify(err)}`));

}
