const reply = require('../logic/_handleReply')

module.exports = async (page, newChatText) => {
  console.log(`${new Date()} replying ${newChatText.user} ${newChatText.content}`)
  try {
    newChatText.reply = await reply(newChatText.content)
    let nc = newChatText
    delete nc.selector
    nc = JSON.stringify(nc)

    await page.sendText( newChatText.user, newChatText.reply)

    console.log(`${new Date()} ${newChatText.reply}`)

  } catch (err) {
    console.error(`${new Date()} ${err}`)
  }

}