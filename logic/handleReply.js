const reply = require('./_handleReply')

module.exports = async (page, newChatText) => {
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