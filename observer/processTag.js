const processUnstructured = require('./process-unstructured')
const { 
  keywords 
} = require('../config')


module.exports = (messageBody) => {

  let contentArr = []
  let formattedText

  let isTag = messageBody && messageBody.charAt(0) == '#' ? true : false

  if(isTag) {
    if (messageBody.includes('alamat')) {
      messageBody = messageBody.split('alamat').join('#')
    }
  
    if (messageBody.includes('.')) {
      messageBody = messageBody.split('.').join('')
    }
  
    while (messageBody.includes('##')) {
      messageBody = messageBody.split('##').join('#')
    }
  
    contentArr = messageBody.split('#')
    contentArr = contentArr.map(e => e.trim())
    contentArr.shift()
    
    let firstWord = contentArr.shift()
    
    if(firstWord){
      firstWord = firstWord.split(' ').join('')
    }
    
    let isKeyword = keywords.filter(e => firstWord === e)
    
    if(!isKeyword.length){
  
      formattedText = processUnstructured(messageBody)
  
    } else {
      formattedText = messageBody
    }
  
  } else {

    formattedText = processUnstructured(messageBody)

  }


  console.log(formattedText)

  return formattedText

}