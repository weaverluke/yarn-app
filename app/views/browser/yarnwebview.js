'use strict';

var React = require('react-native');
var {
	StyleSheet,
	WebView
} = React;

var WebViewBridge = require('react-native-webview-bridge');

var log = require('../../logger/logger');
var readability = require('node-read');
var wordHelpers = require('./wordHelpers');

var actions = require('../../actions/actions');

var YARN_API = require('./websiteapi').toString();
YARN_API = '(' + YARN_API + '())';

var uiConfig = require('../../uiconfig');

function encodeMessage(name, data) {
	return JSON.stringify({
		name: name,
		data: data
	});
}

function decodeMessage(msg) {
	return JSON.parse(msg);
}

var BGWASH = 'rgba(255,255,255,0.8)';
var WEBVIEW_REF = 'webview';

//var YARN_API;
//RNFS.readDir('/', RNFS.MainBundle)
//	.then((result) => {
//		//console.log('GOT RESULT', result);
//		for (var i = 0; i < result.length; i++) {
//			if (result[i].name === 'yarnHighlighter.js') {
//				return RNFS.readFile(result[i].path).then(function (result) {
//					//console.log('file contents:', result);
//					YARN_API = result;
//				});
//			}
//		}
//	});

var Browser = React.createClass({
	lastParsedContent: '',
	waitForContentTimeout: 0,

	getInitialState: function () {
		return {
			status: 'No Page Loaded',
			backButtonEnabled: false,
			forwardButtonEnabled: false,
			loading: true,
			url: this.props.url
		}
	},

	render: function () {
		return (
			<WebViewBridge
				ref={WEBVIEW_REF}
				automaticallyAdjustContentInsets={false}
				style={styles.webView}
				url={this.state.url}
				javaScriptEnabledAndroid={true}
				onNavigationStateChange={this.onNavigationStateChange}
				startInLoadingState={true}
				renderError={function () {
					actions.emit(actions.NETWORK_ERROR_OCCURRED)
				}}
			/>
		);
	},

	componentDidMount: function () {
		this.refs[WEBVIEW_REF].onMessage(function (message) {
			var msg = decodeMessage(message);

			switch (msg.name) {
				case 'WEBSITE_CONTENT':
					clearTimeout(this.waitForContentTimeout);
					console.log('website content received', msg.data.length, msg.data.length < 100 ? msg.data : '');
					log({
						message: 'Page content received',
						url: this.props.url,
						length: msg.data.length
					});
					//if (!msg.data || msg.data.indexOf('body') === -1) {
					//	return this.scheduleParsing();
					//}
					this.parseWebsiteContent(msg.data);
					break;

				case 'WORDS_CHANGED':
					console.log('words changed', msg.data);
					break;

				case 'LOG':
					var args = ['WEBVIEW LOG:'].concat(msg.data);
					console.log.apply(console, args);
					break;

				case 'WEBSITE_READY':
					this.setHighlightColor(uiConfig.COLORS.ORANGE_BG);
					this.requestWebsiteContent();
					break;

				case 'WORDS':
					console.log('visited words:', msg.data);
					this.props.onVisibleWordsChanged && this.props.onVisibleWordsChanged(msg.data);
					break;

				case 'SCROLL':
					this.props.onScroll && this.props.onScroll(msg.data);
					break;

				case 'NOT_ALLOWED_URL':
					this.props.onNotAllowedUrl && this.props.onNotAllowedUrl(msg.data);
			}

		}.bind(this));
	},

	onNavigationStateChange: function (navState) {
		// pass navigation state to parent
		this.props.onNavigationStateChange && this.props.onNavigationStateChange(navState);

		console.log('onNavigationStateChange', navState);
		this.setState({
			url: navState.url,
			status: navState.title,
			loading: navState.loading
		});

		//function lock() {
		//	window.yx ? window.yx++ : (window.yx = 1);
		//	function prevent(ev) {
		//		console.log('PREVENT:', ev.target, ev);
		//		if (ev.target && ev.target.tagName.toLowerCase() === 'a') {
		//			ev.preventDefault();
		//			ev.stopPropagation();
		//		}
		//	}
		//	document.addEventListener('click', prevent, true);
		//}
		//var s = '(' + lock.toString() + '());'
		//
		//if (!navState.loading) {
		//	this.refs[WEBVIEW_REF].evalScript(s);
		//}
	},

	requestWebsiteContent: function (shouldInjectYarnApi) {
		this.sendCommand('GET_HTML');
		this.waitForContentTimeout = setTimeout(function () {
			console.log('!!!!!! no content, retry');
			this.requestWebsiteContent();
		}.bind(this), 5000);
	},

	parseWebsiteContent: function (html) {
		//debugger;
		readability(html, function (err, article, meta) {
			//console.log('html to parse', html);
			//console.log('parsed html', article.title, article.content);
			if (err) {
				throw err;
			}
			var content = (article.content || '').replace(/\s/g, ' ');
			// if there's no content then wait for it
			if (!content.length) {
				//return this.scheduleParsing();
				return this.requestWebsiteContent();
			}
			// if there's a content but it's different from previously stored then try again with a shorter timeout
			// as page might still be loading
			//else if (this.lastArticleContent !== article.content) {
			//	this.lastArticleContent = article.content;
			//	return this.scheduleParsing(true);
			//}

			var contentToParse = article.title + ' ' + article.content;
			console.log('content to parse: ', contentToParse);
			// we don't want to parse the same content twice
			if (this.lastParsedContent === contentToParse) {
				console.log('content was already parsed - terminating');
				return;
			}
			this.lastParsedContent = contentToParse;
			var range = this.props.userRange;
			var level = this.props.userLevel || 50;
			var words = wordHelpers.extractWordsFromArticle(contentToParse, level - range, level + range);

			var attempts = 0;
			while (words.length < 8 && attempts++ < 5) {
				log({
					message: 'Not enough words, extending the range',
					previousRange: range,
					wordsForPreviousRange: words,
					newRange: range + 5
				});
				range += 5;
				words = wordHelpers.extractWordsFromArticle(contentToParse, level - range, level + range);
			}

			// this should be done via store
			//this.refs[WEBVIEW_REF].send(encodeMessage('PREPARE_WORDS', words));
			console.log('parsed words:', words);
			this.props.onWordsParsed && this.props.onWordsParsed(words);
		}.bind(this));
	},

	injectYarnWebsiteApi: function () {
		try {
			console.log('sending YARN API to webview');
			this.refs[WEBVIEW_REF].injectBridgeScript();
			this.refs[WEBVIEW_REF].evalScript(YARN_API);
		} catch (ex) {
			console.log('INJECTION ERROR!');
		}
	},

	sendCommand: function (command, data) {
		this.refs[WEBVIEW_REF].send(encodeMessage(command, data));
	},

	prepareWords: function (words) {
		this.sendCommand('PREPARE_WORDS', words);
	},

	stopScrollTracking: function () {
		this.sendCommand('STOP_SCROLL_TRACKING');
	},

	goBack: function () {
		this.refs[WEBVIEW_REF].goBack();
	},

	goForward: function () {
		this.refs[WEBVIEW_REF].goForward();
	},

	reload: function () {
		this.refs[WEBVIEW_REF].reload();
	},

	highlightWord: function (word) {
		this.sendCommand('HIGHLIGHT_WORD', word);
	},

	scrollToWord: function (word) {
		this.sendCommand('SCROLL_TO_WORD', word);
	},

	unhighlightWords: function () {
		this.sendCommand('UNHIGHLIGHT_WORDS');
	},

	resetLastParsedContent: function () {
		this.lastParsedContent = '';
	},

	setHighlightColor: function (color) {
		this.sendCommand('SET_HIGHLIGHT_COLOR', color);
	},

	goToRandomUrl: function () {
		this.sendCommand('GO_TO_RANDOM_URL');
	}
});

var styles = StyleSheet.create({
	webView: {
		backgroundColor: BGWASH,
		height: 350
	}
});
module.exports = Browser;
