const processTag = require('./processTag')

const getInstance = require('./getInstance')

const generateReply = require('./generateReply')

module.exports = async client => {
  const {
    instance,
    STATEMENTS
  } = await getInstance()

  client.onMessage(async message => {

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
    statement: STATEMENTS.ALL, //INSERT,
    onEvent: async (event) => { // You will receive the events here
      await instanceEvent(event, client)
    },
  });

}
