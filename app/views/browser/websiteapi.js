module.exports = function () {

	if (window.yarnInitialised) {
		return;
	}
	window.yarnInitialised = true;

	window.yarnHighlight = (function () {

		var SKIP_NODES = ['SCRIPT', 'NOSCRIPT'];

		var styleEl;
		var highlightStyleEl;

		var highlightColor = '#44FF44';
		var visitedWords = [];

		function setHighlightColor(color) {
			highlightColor = color;
			injectHighlightStyle();
		}

		function prepareWords(words) {
			injectStyles();
			injectHighlightStyle();
			reset();
			words.forEach(prepareWord);
			window.addEventListener('scroll', onPageScroll);
			onPageScroll();
			return visitedWords;
		}

		function injectStyles() {
			if (styleEl && styleEl.parentNode) {
				styleEl.parentNode.removeChild(styleEl);
			}
			var head = document.head || document.getElementsByTagName('head')[0];

			var bgAnimationStyle = '-webkit-transition: background-color 500ms linear;'+
				'transition: background-color 500ms linear;';

			var commonCss = bgAnimationStyle +
				'width: 2px; height: 100%;' +
				'position: absolute;' +
				'top: 0;' +
				'content: "";' +
				'display: block;' +
				'} ';

			var css = '[data-yarn-highlight] { position: relative; background-color:rgba(0,0,0,0) } ' +

				'[data-yarn-highlight].highlighted { ' +
				bgAnimationStyle +
				'font-style:inherit;font-weight:inherit} ' +

				'[data-yarn-highlight].highlighted:before {' +
				'position:absolute; top:0; left:-2px;' +
				'border-top-left-radius:2px;' +
				'border-bottom-left-radius:2px;' +
				commonCss +

				'[data-yarn-highlight].highlighted:after {' +
				'position:absolute; top:0; right:-2px;' +
				'border-top-right-radius:2px;' +
				'border-bottom-right-radius:2px;' +
				commonCss;

			styleEl = document.createElement('style');

			styleEl.type = 'text/css';
			if (styleEl.styleSheet){
				styleEl.styleSheet.cssText = css;
			} else {
				styleEl.appendChild(document.createTextNode(css));
			}

			head.appendChild(styleEl);
		}

		function injectHighlightStyle() {
			if (highlightStyleEl && highlightStyleEl.parentNode) {
				highlightStyleEl.parentNode.removeChild(highlightStyleEl);
			}

			var css = '[data-yarn-highlight].highlighted, ' +
			'[data-yarn-highlight].highlighted:before, ' +
			'[data-yarn-highlight].highlighted:after {' +
				'background-color:' + highlightColor + '}';

			var head = document.head || document.getElementsByTagName('head')[0];
			styleEl = document.createElement('style');

			styleEl.type = 'text/css';
			if (styleEl.styleSheet){
				styleEl.styleSheet.cssText = css;
			} else {
				styleEl.appendChild(document.createTextNode(css));
			}

			head.appendChild(styleEl);
		}

		function prepareWord(word) {
			var n;
			var walker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);

			var rx = new RegExp('\\b' + word + '\\b');

			while (n = walker.nextNode()) {

				if (SKIP_NODES.indexOf(n.parentNode.tagName) !== -1) {
					continue;
				}

				if (rx.test(n.nodeValue)) {
					var node = n.parentNode;
					node.innerHTML = node.innerHTML.replace(rx,
						'<mark data-yarn-highlight="' +word+ '">' +word+ '</mark>'
					);
					return true;
				}
			}
			return false;
		}

		function highlight(word, unhighlightOthers, scrollToHighlightedWord) {
			if (unhighlightOthers) {
				unhighlight()
			}
			if (!word.tagName) {
				word = getWordElByWord(word);
			}
			if (word) {
				word.classList.add('highlighted');
				//word.style.backgroundColor = highlightColor;
				word.dataset.yarnHighlighted = 1;
			}
			if (scrollToHighlightedWord) {
				scrollToWord(word);
			}
		}

		function getWordElByWord(word) {
			return document.querySelector('[data-yarn-highlight=\'' +word+ '\']');
		}

		function unhighlight(word) {
			if (word) {
				if (!word.tagName) {
					word = getWordElByWord(word);
				}
				if (word) {
					word.classList.remove('highlighted');
					//word.style.backgroundColor = 'rgba(0,0,0,0)';
					delete word.dataset.yarnHighlighted;
				}
			}
			else {
				[].slice.call(document.querySelectorAll('[data-yarn-highlighted=\'1\']')).forEach(function (wordEl) {
					unhighlight(wordEl);
				});
			}
		}

		function scrollToWord(word) {
			if (!word.tagName) {
				word = getWordElByWord(word);
			}
			if (word) {
				word.scrollIntoViewIfNeeded();
			}
		}

		function highlightVisitedWords() {
			var previouslyVisited = visitedWords.length;
			var words = [].slice.call(document.querySelectorAll('[data-yarn-highlight]'));
			for (var i = 0; i < words.length; i++) {
				if (isWordInView(words[i]) && ! words[i].dataset.yarnHighlighted) {
					highlight(words[i]);
					var word = words[i].dataset.yarnHighlight;
					if (visitedWords.indexOf(word) === -1) {
						visitedWords.push(word);
					}
				}
			}
			if (previouslyVisited != visitedWords.length) {
				console.log('visited words', visitedWords.length, visitedWords);
				send('WORDS', visitedWords);
			}

		}

		function isWordInView(wordEl) {
			var bbox = wordEl.getBoundingClientRect();

			// this method makes sure that word is inside viewport
			//return bbox.top > 0 &&
			//	bbox.bottom < window.innerHeight &&
			//	bbox.left > 0 &&
			//	bbox.right < window.innerWidth;

			// this checks only if bottom and right edges have been scrolled into view
			// even if word was omitted during very fast scroll this method will catch it
			return bbox.bottom < window.innerHeight && bbox.right < window.innerWidth;
		}

		function reset() {
			// remove all highlights
			var node;
			while (node = document.querySelector('[data-yarn-highlight]')) {
				var parent = node.parentNode;
				var html = parent.innerHTML;
				html = html.replace(/<mark.*?>/i, '');
				html = html.replace('</mark>','');
				parent.innerHTML = html;
			}

		}

		function onPageScroll() {
			setTimeout(highlightVisitedWords, 0);
		}

		function getVisitedWords() {
			return visitedWords;
		}

		function stopScrollTracking() {
			window.removeEventListener('scroll', onPageScroll);
		}

		reset();

		return {
			highlight: highlight,
			scrollToWord: scrollToWord,
			setHighlightColor: setHighlightColor,
			prepareWords: prepareWords,
			highlightVisitedWords: highlightVisitedWords,
			getVisitedWords: getVisitedWords,
			stopScrollTracking: stopScrollTracking,
			unhighlight: unhighlight
		};

	}());


	var yarnBridge;
	function encodeMessage(name, data) {
		return JSON.stringify({
			name: name,
			data: data
		});
	}

	function decodeMessage(msg) {
		return JSON.parse(msg);
	}

	var queue = [];
	var sendTimeout;

	function send(name, data) {
		// if no bridge yet then queue message
		if (name) {
			queue.push([name, data]);
		}


		if (yarnBridge) {
			sendNextFromQueue();
		}
	}

	function sendNextFromQueue() {
		if (sendTimeout || !queue.length) {
			return;
		}

		sendTimeout = setTimeout(function () {
			sendTimeout = 0;

			if (!queue.length) {
				return;
			}

			sendPacket(queue.shift());
			sendNextFromQueue();
		}, 100);
	}

	function sendPacket(packet) {
		var msg = encodeMessage(packet[0], packet[1]);
		yarnBridge.send(msg);
	}


	function onMessage(msg) {
		//log('onMessage', msg);
		switch (msg.name) {
			case 'GET_HTML':
				return sendHtml();

			case 'SET_HIGHLIGHT_COLOR':
				return yarnHighlight.setHighlightColor(msg.data);

			case 'PREPARE_WORDS':
				return yarnHighlight.prepareWords(msg.data);

			case 'STOP_SCROLL_TRACKING':
				return yarnHighlight.stopScrollTracking();

			case 'HIGHLIGHT_WORD':
				return yarnHighlight.highlight(msg.data, true, true);

			case 'SCROLL_TO_WORD':
				return yarnHighlight.scrollToWord(msg.data);

			case 'UNHIGHLIGHT_WORDS':
				return yarnHighlight.unhighlight();

			case 'GO_TO_RANDOM_URL':
				return goToRandomUrl();

			default:
				return;
		}
	}

	function goToRandomUrl() {
		var links = [].slice.call(document.getElementsByTagName('a'));
		var matchingOrigin = getLinksMatchingCurrentDomain(links);

		links = matchingOrigin.length ? matchingOrigin : links;

		links.map(function (link) {
			return link.getAttribute('href');
		});

		// sort from the longest to the shortest
		links.sort(function (a, b) {
			return b.length - a.length;
		});

		// pick 50% of the longest links
		var index = Math.floor(Math.random() * 3);
		location = links[index];
	}

	function getLinksMatchingCurrentDomain(links) {
		var origin = location.origin;

		return links.filter(function (link) {
			var href = link.getAttribute('href');
			// ignore url to this page
			if (!href || href === location.href) {
				return false;
			}
			// trim trailing slash as location.origin doesn't have it
			href = href.replace(/\/$/, '');
			return href && href.indexOf(origin) === 0 && href !== origin;
		});
	}

	var lastBodyLength = -1;
	var alreadySent = false;

	function sendHtml() {
		if (alreadySent) {
			return;
		}

		var currentBodyLength = document.body.innerHTML.length;
		if (/(interactive|complete)/.test(document.readyState) && document.title &&
				// wait for body to stop changing
			currentBodyLength === lastBodyLength && currentBodyLength > 100) {

			console.log('sending html', document.body.innerHTML.length);
			var start = '<html><head><title>' + document.title + '</title></head>';

			alreadySent = true;

			// send only body content
			return send('WEBSITE_CONTENT', start + document.body.outerHTML + '</html>');
		}
		else {
			lastBodyLength = currentBodyLength;
			log('delay sendHtml, document readyState: ' + document.readyState + ' body length:' + currentBodyLength);
			setTimeout(sendHtml, 800);
		}
	}

	function WebViewBridgeReady(cb) {
		if (window.WebViewBridge) {
			cb(window.WebViewBridge);
			return;
		}

		function handler() {
			//remove the handler from listener since we don't need it anymore
			window.removeEventListener('WebViewBridge', handler, false);
			//pass the WebViewBridge object to the callback
			cb(window.WebViewBridge);
		}

		//if WebViewBridge doesn't exist in global scope attach itself to document
		//event system. Once the code is being injected by extension, the handler will
		//be called.
		window.addEventListener('WebViewBridge', handler, false);
	}

	function bindScrollInfo() {
		window.addEventListener('scroll', function () {
			setTimeout(function () {
				send('SCROLL', {x: window.scrollX, y: window.scrollY});
			}, 1);
		});
	}

	//var log = console.log.bind(console);
	function log() {
		var args = [].slice.call(arguments);
		send('LOG', args);
	}

	function run() {
		console.log('run()');
		WebViewBridgeReady(function (WebViewBridge) {

			console.log('bridge ready');
			yarnBridge = WebViewBridge;
			WebViewBridge.onMessage = function (msg) {
				var message = decodeMessage(msg);
				onMessage(message);
			};
			var msg;
			send();
			//while (msg = queue.shift()) {
			//	send.apply(null, msg);
			//}
			bindScrollInfo();
			console.log('WEBSITE_READY');
			hookLinks();
			send('WEBSITE_READY');
		});
	}

	// try to prevent universal links
	function hookLinks() {
		//document.addEventListener('click', function (ev) {
		//	if (yarnBridge) {
		//		if (ev.target && ev.target.tagName.toLowerCase() === 'a' && ev.target.getAttribute('href')) {
		//			ev.preventDefault();
		//			ev.stopPropagation();
		//
		//			send('REQUEST_URL_CHANGE', ev.target.getAttribute('href'));
		//			//location = ev.target.getAttribute('href');
		//		}
		//	}
		//}, true);
	}

	console.log('start! ', location.href, document.readyState, document.documentElement.outerHTML.length);

	if (/(interactive|complete)/.test(document.readyState)) {
		console.log('dom content already loaded');
		run();
	}
	else {
		console.log('wait for dom content to be loaded');
		document.addEventListener('DOMContentLoaded', function () {
			console.log('DOMContentLoaded!', document.documentElement.outerHTML.length);
			run();
		});
	}
};


