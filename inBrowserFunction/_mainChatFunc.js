module.exports = (mainChatSel, mainChatSel2) => {
	const elementCssPath = (element, options) => {

		var defaultOptions = {
			unique: false,
			startWithClosestId: false,
			directDescendant: false
		}
		for (var key in options) {
			defaultOptions[key] = options[key];
		}
		var options = defaultOptions;
		// make sure element is a single dom node
		if (element.nodeType != 1) {
			return null;
		}
		// array of individual element selectors
		var paths = [];
		// iterate through parent elements
		for (; element && element.nodeType == 1; element = element.parentNode) {
			// make sure element exists
			if (!element || !element.nodeType) {
				return null;
			}
			var tag = element.nodeName.toLowerCase();
			var selector = tag;
			// if element has an id, add them to selector
			if (element.id) {
				selector += "#" + element.id;
			}
			// get classList
			var className = element.className;
			var classList = [];
			if (typeof className === 'string' && className !== '') {
				classList = className.split(/\s+/);
			}
			// if element has 1 or more classes, add them to selector
			if (classList.length >= 1) {
				for (var i = 0; i < classList.length; i++) {
					selector += "." + classList[i];
				}
			}
			// option to make path unique
			if (options.unique === true) {
				var siblingIndex = 0;
				for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
					if (sibling.nodeType != 1) {
						continue;
					}
					siblingIndex++;
				}
				if (tag != 'html') {
					selector += ":nth-child(" + (siblingIndex + 1) + ")";
				}
			}
			// add individual selector to paths array
			paths.splice(0, 0, selector);
			// option to make path start with the nearest element with an id
			if (options.startWithClosestId === true) {
				if (element.id) {
					break;
				}
			}
		}
		// turn paths array into string
		paths = paths.length ? paths.join(options.directDescendant || options.unique ? ' > ' : ' ') : null;
		return paths;
	}

	const getCss = el => {
		let newEl = elementCssPath(el, {
			unique: true,
			directDescendant: true,
			startWithClosestId: true
		})
		if(newEl.includes('#')){
			newEl = '#'+newEl.split('#').pop()
		}
		if(newEl.includes('div.')){
			newEl = newEl.split('div.').join('.')
		}
		return newEl
	}

	const getChildc = arr =>{
		let cont = ''
		for(let i = 0; i < arr.length; i++){
			let node = arr[i]
			let innerText, wholeText
			switch(node.nodeType){
				case 1:
					let childArr = node.childNodes
					if(childArr.length){
						cont += getChildc(childArr)
					}
					if(node && node.nodeName == 'IMG' && node.hasAttribute('alt')){
						cont += node.getAttribute('alt')
					}
					break
				case 3:
					wholeText = node.wholeText
					if(wholeText && !node.parentNode.className.includes('quoted-mention') && !node.parentNode.className.includes('_2a1Yw') && node.parentNode.className !== '_3EFt_'){
						cont += wholeText
					}
					break
			}
		}
		return cont.toLowerCase()
	}
	let newMainChatElArr = []
	let mainChatElArr = document.querySelectorAll(mainChatSel)

	if(!mainChatElArr.length) {
		mainChatElArr = document.querySelectorAll(mainChatSel2)
	}

	for (let mainChatEl of mainChatElArr){
		let newChatText = {}
		newChatText.selector = getCss(mainChatEl)
		let timeAndUserEl = mainChatEl.querySelector('.copyable-text[data-pre-plain-text]')
		if(timeAndUserEl && timeAndUserEl.hasAttribute('data-pre-plain-text')){

			let timeAndUser = timeAndUserEl.getAttribute('data-pre-plain-text')

			if(timeAndUser){

				timeAndUser = timeAndUser.replace('[', ']')

				let timeAndUserArr = timeAndUser.split(']')

				newChatText.time = timeAndUserArr[1].split(',')[0]

				newChatText.date = timeAndUserArr[1].split(',')[1].trim()

				newChatText.user = timeAndUserArr[2].trim().replace(':', '')

			}

		}


		let content = ''

		let contentArr = mainChatEl.childNodes


		if(contentArr.length){

			content += getChildc(contentArr)

		}


		if(content !== ''){

			newChatText.content = content

		}

		

		newMainChatElArr.push(newChatText)
	
}

return newMainChatElArr	
}