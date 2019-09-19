const moment = require('moment')
moment.locale('id')

const getPatient = require('./getPatient')

module.exports = async ( event, client) => {
  let tglDaftar = moment(event.timestamp, 'x').format('DD-MM-YYYY')

  let patient = await getPatient(event)
  
  if( event.type === 'INSERT' /* && event.table === 'visits'*/ ) {
    
    if(tglDaftar === moment().format('DD-MM-YYYY')){//} && jam >= 8 ) {

      try {
        if(patient && patient.no_hp && patient.no_hp.match(/^(08)([0-9]){1,12}$/)) {

          //send wa here
          patient.no_hp = `62${patient.no_hp.substr(1)}`
          
          let name = patient.nama
          console.log(`data pasien: ${JSON.stringify(patient)}`)

          let text = `Terima kasih atas kunjungan ${name}, ke Puskesmas ${process.env.PUSKESMAS}.\n Mohon kesediaannya untuk dapat mengisi form kepuasan pelanggan berikut:\n ${process.env.FORM_LINK}\n`

          let from = `${patient.no_hp}@c.us`

          await client.sendText( from, text)
     
        } 

      }catch(err){
        console.error(err)
      }

    }

  }

}