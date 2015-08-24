module.exports = function () {

	if (window.yarnInitialised) {
		return;
	}
	window.yarnInitialised = true;

	window.yarnHighlight = (function () {

		var SKIP_NODES = ['SCRIPT', 'NOSCRIPT'];

		var highlightColor = '#44FF44';
		var visitedWords = [];

		function setHighlightColor(color) {
			highlightColor = color;
		}

		function prepareWords(words) {
			reset();
			words.forEach(prepareWord);
			window.addEventListener('scroll', onPageScroll);
			onPageScroll();
			return visitedWords;
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
						'<mark data-yarn-highlight=\'' +word+
						'\' style=\'border-radius:3px;background-color:rgba(0,0,0,0);font-style:inherit;font-weight:inherit;\'>'
						+word+'</mark>'
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
				word.style.backgroundColor = highlightColor;
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
					word.style.backgroundColor = 'rgba(0,0,0,0)';
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
	function send(name, data) {
		// if no bridge yet then queue message
		if (!yarnBridge) {
			queue.push([name, data]);
			return;
		}
		var msg = encodeMessage(name, data);
		yarnBridge.send(msg);
	}

	var sendScheduled = false;
	function onMessage(msg) {
		//log('onMessage', msg);
		switch (msg.name) {
			case 'GET_HTML':
				return sendHtml();

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

			default:
				return;
		}
	}

	function sendHtml() {
		if (document.readyState === 'complete') {
			log('sending html', document.body.innerHTML.length);
			return send('WEBSITE_CONTENT', document.documentElement.outerHTML);
		}
		else {
			log('delay sendHtml');
			setTimeout(sendHtml, 250);
		}
	}

	function WebViewBridgeReady(cb) {
		if (window.WebViewBridge) {
			cb(window.WebViewBridge);
			return;
		}

		function handler() {
			//remove the handler from listener since we don't need it anymore
			document.removeEventListener('WebViewBridge', handler, false);
			//pass the WebViewBridge object to the callback
			cb(window.WebViewBridge);
		}

		//if WebViewBridge doesn't exist in global scope attach itself to document
		//event system. Once the code is being injected by extension, the handler will
		//be called.
		document.addEventListener('WebViewBridge', handler, false);
	}

	function log() {
		var args = [].slice.call(arguments);
		send('LOG', args);
	}

	function wait() {
		// we compare against length of 100 to make sure that there's something in body already
		if (document.readyState == 'complete' && document.body && document.body.innerHTML.length > 100) {
			WebViewBridgeReady(function (WebViewBridge) {

				yarnBridge = WebViewBridge;
				WebViewBridge.onMessage = function (msg) {
					var message = decodeMessage(msg);
					onMessage(message);
				};
				var msg;
				while (msg = queue.shift()) {
					send.apply(null, msg);
				}
				send('WEBSITE_READY');
			});
		}
		else {
			setTimeout(wait, 13);
		}
	}
	wait();
};


