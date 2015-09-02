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

var YARN_API = require('./websiteapi').toString();
YARN_API = '(' + YARN_API + '())';
//console.log('API:', YARN_API);


function encodeMessage(name, data) {
	return JSON.stringify({
		name: name,
		data: data
	});
}

function decodeMessage(msg) {
	return JSON.parse(msg);
}

var HIGHLIGHT_COLOR = '#22FF22';

var BORDER = '#E7EAEA';
var BGWASH = 'rgba(255,255,255,0.8)';
var HEADER = '#F9FAFB';

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

	getInitialState: function () {
		return {
			status: 'No Page Loaded',
			backButtonEnabled: false,
			forwardButtonEnabled: false,
			loading: true
		}
	},

	handleTextInputChange: function (event) {
		this.inputText = event.nativeEvent.text;
	},

	render: function () {
		return (
			<WebViewBridge
				ref={WEBVIEW_REF}
				automaticallyAdjustContentInsets={false}
				style={styles.webView}
				url={this.props.url}
				javaScriptEnabledAndroid={true}
				onNavigationStateChange={this.onNavigationStateChange}
				startInLoadingState={true}
			/>
		);
	},

	componentDidMount: function () {
		//this.refs[WEBVIEW_REF].evalScript('window.onerror = function (err) { alert(err.toString() + " " + err.message); };');
		this.refs[WEBVIEW_REF].onMessage(function (message) {
			var msg = decodeMessage(message);

			switch (msg.name) {
				case 'WEBSITE_CONTENT':
					console.log('website content received', msg.data.length);
					log({
						message: 'Page content received',
						url: this.props.url,
						length: msg.data.length
					});
					if (!msg.data || msg.data.indexOf('body') === -1) {
						return this.scheduleParsing();
					}
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
					this.sendCommand('GET_HTML');
					break;

				case 'WORDS':
					console.log('visited words:', msg.data);
					this.props.onVisibleWordsChanged && this.props.onVisibleWordsChanged(msg.data);
					break;

				case 'SCROLL':
					this.props.onScroll && this.props.onScroll(msg.data);
					break;
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
		if (!navState.loading) {
			this.scheduleParsing();
		}
	},

	scheduleParsing: function (fast) {
		if (this.parseTimeout) {
			clearTimeout(this.parseTimeout);
		}
		console.log('schedule parsing');
		//return;

		this.parseTimeout = setTimeout(function () {
			this.parseTimeout = undefined;
			//this.refs[WEBVIEW_REF].evaluateJavaScript(highlighter, function (err, resp) {
			//	console.log('highlighter callback', err, resp);
			//});
			//this.refs[WEBVIEW_REF].evaluateJavaScript('(function () { return window.yarnHighlighter.toString()}())', function (err, resp) {
			//	console.log('check highlighter callback', err, resp);
			//});
			//this.refs[WEBVIEW_REF].evaluateJavaScript('document.documentElement.outerHTML', function (err, result) {
			//	if (!result || result.indexOf('body') === -1) {
			//		return this.scheduleParsing();
			//	}
			//	this.parseWebsiteContent(result);
			//}.bind(this));

			console.log('sending YARN API to webview');
			this.refs[WEBVIEW_REF].injectBridgeScript();
			this.refs[WEBVIEW_REF].evalScript(YARN_API);
			//this.refs[WEBVIEW_REF].send(encodeMessage('GET_HTML'));
		}.bind(this), fast ? 300 : 700);
	},

	parseWebsiteContent: function (html) {
		readability(html, function (err, article, meta) {
			//console.log('html to parse', html);
			//console.log('parsed html', article.title, article.content);
			if (err) {
				throw err;
			}
			var content = (article.content || '').replace(/\s/g, ' ');
			// if there's no content then wait for it
			if (!content.length) {
				return this.scheduleParsing();
			}
			// if there's a content but it's different from previously stored then try again with a shorter timeout
			// as page might still be loading
			//else if (this.lastArticleContent !== article.content) {
			//	this.lastArticleContent = article.content;
			//	return this.scheduleParsing(true);
			//}

			var contentToParse = article.title + ' ' + article.content;
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
	}
});

var styles = StyleSheet.create({
	webView: {
		backgroundColor: BGWASH,
		height: 350
	}
});
module.exports = Browser;
