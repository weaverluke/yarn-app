'use strict';

var React = require('react-native');
var {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	WebView
} = React;

var readability = require('node-read');
var wordHelpers = require('../../../wordHelpers');

var HIGHLIGHT_COLOR = '#22FF22';
var USER_LEVEL = 40;
var RANGE = 30;
var highlighter = 'window.yarnHighlight=function(){function e(e){var r,d=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,!1);n();for(var i=new RegExp("\\\\b"+e+"\\\\b");r=d.nextNode();)if(-1===o.indexOf(r.parentNode.tagName)&&i.test(r.nodeValue))return t.node=r.parentNode,t.content=r.parentNode.innerHTML,t.node.innerHTML=t.content.replace(i,\'<mark style="background-color:' + HIGHLIGHT_COLOR + ';font-style:inherit;font-weight:inherit;">\'+e+"</mark>"),t.node.scrollIntoViewIfNeeded(),!0;return!1}function n(){t.node&&(t.node.innerHTML=t.content,t.node=void 0,t.content=void 0)}var o=["SCRIPT","NOSCRIPT"],t={node:void 0,content:void 0};return{highlight:e}}();';

var BORDER = '#E7EAEA';
var BGWASH = 'rgba(255,255,255,0.8)';
var HEADER = '#F9FAFB';
var DISABLED_WASH = 'rgba(255,255,255,0.25)';

var WEBVIEW_REF = 'webview';
var TEXT_INPUT_REF = 'urlInput';

var Browser = React.createClass({
	inputText: '',

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
			<View style={[styles.container]}>
				<View style={[styles.addressBarRow]}>
					<TouchableOpacity onPress={this.goBack}>
						<View style={this.state.backButtonEnabled ? styles.navButton : styles.disabledButton}>
							<Text>{'<'}</Text>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={this.goForward}>
						<View style={this.state.forwardButtonEnabled ? styles.navButton : styles.disabledButton}>
							<Text>{'>'}</Text>
						</View>
					</TouchableOpacity>
					<TextInput
						ref={TEXT_INPUT_REF}
						autoCapitalize="none"
						value={this.state.url}
						onSubmitEditing={this.onSubmitEditing}
						onChange={this.handleTextInputChange}
						clearButtonMode="while-editing"
						style={styles.addressBarTextInput}
					/>
					<TouchableOpacity onPress={this.pressGoButton}>
						<View style={styles.goButton}>
							<Text>Go!</Text>
						</View>
					</TouchableOpacity>
				</View>
				<WebView
					ref={WEBVIEW_REF}
					automaticallyAdjustContentInsets={false}
					style={styles.webView}
					url={this.props.url}
					javaScriptEnabledAndroid={true}
					onNavigationStateChange={this.onNavigationStateChange}
					startInLoadingState={false}
				/>
			</View>
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
		console.log('onNavigationStateChange', navState);
		this.setState({
			backButtonEnabled: navState.canGoBack,
			forwardButtonEnabled: navState.canGoForward,
			url: navState.url,
			status: navState.title,
			loading: navState.loading,
		});
		if (!navState.loading) {
			this.scheduleParsing();
		}
	},

	onSubmitEditing: function (event) {
		this.setState({
			words: []
		});
		this.pressGoButton();
	},

	pressGoButton: function () {
		var url = this.inputText.toLowerCase();
		if (url === this.state.url) {
			this.reload();
		} else {
			this.setState({
				url: url,
			});
		}
		// dismiss keyoard
		this.refs[TEXT_INPUT_REF].blur();
	},

	evaluateJavaScript: function () {
		this.refs[WEBVIEW_REF].evaluateJavaScript.apply(this.refs[WEBVIEW_REF], arguments);
	}
});

var styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: HEADER,
	},
	addressBarRow: {
		flexDirection: 'row',
		padding: 8,
		borderBottomWidth: 1,
		borderBottomColor: BORDER
	},
	webView: {
		backgroundColor: BGWASH,
		height: 350,
	},
	addressBarTextInput: {
		backgroundColor: BGWASH,
		borderColor: BORDER,
		borderRadius: 3,
		borderWidth: 1,
		height: 24,
		paddingLeft: 10,
		paddingTop: 3,
		paddingBottom: 3,
		flex: 1,
		fontSize: 14,
	},
	navButton: {
		width: 20,
		padding: 3,
		marginRight: 3,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: BGWASH,
		borderWidth: 1,
		borderColor: BORDER,
		borderRadius: 3,
	},
	disabledButton: {
		width: 20,
		padding: 3,
		marginRight: 3,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: DISABLED_WASH,
		borderColor: 'transparent',
		borderRadius: 3,
		color: '#AAAAAA'
	},
	goButton: {
		height: 24,
		padding: 3,
		marginLeft: 8,
		alignItems: 'center',
		backgroundColor: BGWASH,
		borderColor: BORDER,
		borderWidth: 1,
		borderRadius: 3,
		alignSelf: 'stretch',
	},
	statusBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 5,
		height: 22,
	},
	statusBarText: {
		color: 'white',
		fontSize: 13,
	},
	spinner: {
		width: 20,
		marginRight: 6,
	}
});
module.exports = Browser;