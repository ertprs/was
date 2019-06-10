module.exports = clickSel => {
	let chat = document.querySelector(clickSel)
	//let newNotif = chat.querySelector('.OUeyt') ? chat.querySelector('.OUeyt').innerText : undefined
	let newNotif = chat.querySelector('.P6z4j') ? chat.querySelector('.P6z4j').innerText : undefined
//	let isGroup = chat.querySelector('._2ko65') ? true : false
//	let isGroup = chat.querySelector('span._1bX-5') ? true : false
	//let group, user
	//if(isGroup){
	//	group = chat.querySelector('span._19RFN').getAttribute('title')
	//	user = chat.querySelector('span._2I4wO > span') ? chat.querySelector('span._2I4wO > span').innerText : undefined
	//	user = chat.querySelector('span._1bX-5 > span') ? chat.querySelector('span._1bX-5 > span').innerText : undefined
	//} else {
	//	user = chat.querySelector('span._3NWy8 > span') && chat.querySelector('span._3NWy8 > span').getAttribute('title')
		let user = chat.querySelector('span._19RFN').getAttribute('title')
//		user = chat.querySelector('span._1wjpf').getAttribute('title')
	//}
	//let lastMessage = chat.querySelector('span._2_LEW').getAttribute('title')
//	let lastMessageTime = chat.querySelector('._3T2VG') ? chat.querySelector('._3T2VG').innerText : undefined
	return {
		newNotif,
	//	isGroup,
	//	group,
		user,
		//lastMessage,
		//lastMessageTime
	}
}