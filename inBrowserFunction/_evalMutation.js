module.exports = () => {
	const mutationObserverOptions = {
		attributes: true,
		childList: true, 
		characterData: true,
		subtree: true
	}

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

		if (element.nodeType != 1) {
			return null;
		}

		var paths = [];

		for (; element && element.nodeType == 1; element = element.parentNode) {
			if (!element || !element.nodeType) {
				return null;
			}
			var tag = element.nodeName.toLowerCase();
			var selector = tag;

			if (element.id) {
				selector += "#" + element.id;
			}

			var className = element.className;
			var classList = [];
			if (typeof className === 'string' && className !== '') {
				classList = className.split(/\s+/);
			}

			if (classList.length >= 1) {
				for (var i = 0; i < classList.length; i++) {
					selector += "." + classList[i];
				}
			}

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

			paths.splice(0, 0, selector);

			if (options.startWithClosestId === true) {
				if (element.id) {
					break;
				}
			}
		}

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

	const handleAttributes = mutation => {
		let type = mutation.type
		let selector = getCss(mutation.target)
		let attributeName = mutation.attributeName
		let value = mutation.target.getAttribute(mutation.attributeName)
		if(value){
			console.log(JSON.stringify({
				type,
				selector,
				attributeName,
				value
			}))
		}
	}
	
	const getChildDesc = (type, arr) =>{
		for(let i = 0; i < arr.length; i++){
			let addedNode = arr[i]
			let selector, innerText, wholeText
			switch(addedNode.nodeType){
				case 1:
					let childArr = addedNode.childNodes
					if(childArr.length){
						getChildDesc(type, childArr)
					} 
					break
				case 3:
					selector = getCss(addedNode.parentElement)
					wholeText = addedNode.wholeText
					if(wholeText){
						console.log(JSON.stringify({
							type,
							selector,
							wholeText
						}))
					}
					break
			}
		}
	}

	const handleChildList = mutation => {
		let type = mutation.type
		let addedNodes = mutation.addedNodes
		if(addedNodes.length){
			getChildDesc(type, addedNodes)
		}
	}
	
	const handleCharacterData = mutation => {
		let type = mutation.type
		let selector = getCss(mutation.target.parentElement)
		let data = mutation.target.data
		if(data){
			console.log(JSON.stringify({
				type,
				selector,
				data
			}))
		}
	}

	const describe = mutation => {
		switch(mutation.type){
			case 'attributes':
				log = handleAttributes(mutation)
				break
			case 'characterData':
				log = handleCharacterData(mutation)
				break
			case 'childList':
				log = handleChildList(mutation)
				break
		}
	}

	new MutationObserver( mutations => {
		for(mutation of mutations){
			describe(mutation)
		}
	}).observe(document.body, mutationObserverOptions)
}