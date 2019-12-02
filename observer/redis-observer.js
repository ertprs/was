const redis = require('redis')
const moment = require('moment')
moment.locale('id')

const getPatient = require('./getPatient')

const processTag = require('./processTag')

const generateReply = require('./generateReply')

const subscriber = redis.createClient()

module.exports = async client => {

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

  subscriber.on('message', async (channel, message) => {
    let event = JSON.parse(message)

  //  console.log(JSON.stringify(patient))

    if( event.type === 'INSERT' && event.table === 'visits' ) {

      let tglDaftar = moment(event.timestamp, 'x').format('DD-MM-YYYY')

      if(tglDaftar === moment().format('DD-MM-YYYY')){//} && jam >= 8 ) {

        try{
          let patient = await getPatient(event)

          if(patient && patient.no_hp && patient.no_hp.match(/^(08)([0-9]){1,12}$/)) {

            //send wa here
            patient.no_hp = `62${patient.no_hp.substr(1)}`

            let name = patient.nama
            // console.log(`data pasien: ${JSON.stringify(patient)}`)

            let text = `Terima kasih atas kunjungan ${name}, ke Puskesmas ${process.env.PUSKESMAS}.\n Mohon kesediaannya untuk dapat mengisi form kepuasan pelanggan berikut:\n ${process.env.FORM_LINK}\n`

            let from = `${patient.no_hp}@c.us`

            await client.sendTextToID( from, text)
            console.log(`${tglDaftar} jam ${moment(event.timestamp, 'x').format('H')} send text to: ${from}, isi: ${text.split('\n').join(' ')}`)
          }

        } catch (err) {
          console.error(`${tglDaftar} jam ${moment(event.timestamp, 'x').format('H')} send text error: ${err}`)
        }

      }

    }

    // console.log(`channel: ${channel}, message: ${message}`);
  });

  subscriber.subscribe('simpus');

}
