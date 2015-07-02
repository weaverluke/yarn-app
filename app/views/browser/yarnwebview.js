'use strict';

var React = require('react-native');
var {
	StyleSheet,
	WebView
} = React;

var readability = require('node-read');
var wordHelpers = require('./wordHelpers');

var HIGHLIGHT_COLOR = '#22FF22';
var highlighter = 'window.yarnHighlight=function(){function e(e){var r,d=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,!1);n();for(var i=new RegExp("\\\\b"+e+"\\\\b");r=d.nextNode();)if(-1===o.indexOf(r.parentNode.tagName)&&i.test(r.nodeValue))return t.node=r.parentNode,t.content=r.parentNode.innerHTML,t.node.innerHTML=t.content.replace(i,\'<mark style="background-color:' + HIGHLIGHT_COLOR + ';font-style:inherit;font-weight:inherit;">\'+e+"</mark>"),t.node.scrollIntoViewIfNeeded(),!0;return!1}function n(){t.node&&(t.node.innerHTML=t.content,t.node=void 0,t.content=void 0)}var o=["SCRIPT","NOSCRIPT"],t={node:void 0,content:void 0};return{highlight:e}}();';
var USER_LEVEL = 40;
var RANGE = 30;

var BORDER = '#E7EAEA';
var BGWASH = 'rgba(255,255,255,0.8)';
var HEADER = '#F9FAFB';
var DISABLED_WASH = 'rgba(255,255,255,0.25)';

var WEBVIEW_REF = 'webview';

var Browser = React.createClass({

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
			<WebView
				ref={WEBVIEW_REF}
				automaticallyAdjustContentInsets={false}
				style={styles.webView}
				url={this.props.url}
				javaScriptEnabledAndroid={true}
				onNavigationStateChange={this.onNavigationStateChange}
				startInLoadingState={false}
			/>
		);
	},

	scheduleParsing: function () {
		if (this.parseTimeout) {
			clearTimeout(this.parseTimeout);
		}
		console.log('schedule parsing');

		this.parseTimeout = setTimeout(function () {
			this.parseTimeout = undefined;
			this.refs[WEBVIEW_REF].evaluateJavaScript(highlighter, function () {});
			this.refs[WEBVIEW_REF].evaluateJavaScript('document.documentElement.outerHTML', function (err, result) {
				if (!result || result.indexOf('body') === -1) {
					return this.scheduleParsing();
				}
				this.parseWebsiteContent(result);
			}.bind(this));
		}.bind(this), 1000);
	},

	parseWebsiteContent: function (html) {
		readability(html, function (err, article, meta) {
			if (err) {
				throw err;
			}
			if (!article.content) {
				return this.scheduleParsing();
			}
			var words = wordHelpers.extractWordsFromArticle(article.title + ' ' + article.content, USER_LEVEL, USER_LEVEL + RANGE);

			// this should be done via store
			this.props.onWordsParsed && this.props.onWordsParsed(words.splice(0, 5));
		}.bind(this));
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

	onNavigationStateChange: function (navState) {
		// pass navigation state to parent
		this.props.onNavigationStateChange && this.props.onNavigationStateChange(navState);

		console.log('onNavigationStateChange', navState);
		this.setState({
			url: navState.url,
			status: navState.title,
			loading: navState.loading,
		});
		if (!navState.loading) {
			this.scheduleParsing();
		}
	},

	highlightWord: function (word) {
		this.evaluateJavaScript('window.yarnHighlight.highlight("' + word + '");', function (err, result) {
			console.log('highlight callback', err, result);
		});
	},

	evaluateJavaScript: function () {
		this.refs[WEBVIEW_REF].evaluateJavaScript.apply(this.refs[WEBVIEW_REF], arguments);
	}
});

var styles = StyleSheet.create({
	webView: {
		backgroundColor: BGWASH,
		height: 350,
	}
});
module.exports = Browser;
