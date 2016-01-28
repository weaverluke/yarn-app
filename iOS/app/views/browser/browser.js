'use strict';

var React = require('react-native');
var {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	WebView
} = React;

var gameStateStore = require('../../stores/gamestatestore');
var YarnWebView = require('./yarnwebview');
var actions = require('../../actions/actions');
var log = require('../../logger/logger');

var BORDER = '#E7EAEA';
var BGWASH = 'rgba(255,255,255,0.8)';
var HEADER = '#F9FAFB';
var DISABLED_WASH = 'rgba(255,255,255,0.25)';

var WEBVIEW_REF = 'webview';
var TEXT_INPUT_REF = 'urlInput';
var WORDS_PARSE_TIMEOUT = 10000;

var config = require('../../config');


var Browser = React.createClass({
	lastUrl: '',
	lastTitle: '',
	apiInjectTimeout: 0,

	getInitialState: function () {
		return {
			url: this.props.url,
			urlInInput: this.props.url,
			shortUrl: this.cleanupUrl(this.props.url),
			status: 'No Page Loaded',
			backButtonEnabled: false,
			forwardButtonEnabled: false,
			loading: true
		}
	},

	handleTextInputChange: function (event) {
		this.setState({
			urlInInput: event.nativeEvent.text
		});
	},

	render: function () {
		// undefined to prevent WebView from loading when there's no url yet
		var url = this.state.url || undefined;
		return (
			<View style={[styles.container]}>
				{this.renderAddressBar()}

				<YarnWebView
					ref={WEBVIEW_REF}
					style={styles.webView}
					userRange={this.props.userRange}
					userLevel={this.props.userLevel}
					url={url}
					onNavigationStateChange={this.onNavigationStateChange}
					onWordsParsed={this.onWordsParsed}
					onVisibleWordsChanged={this.onVisibleWordsChanged}
					onNotAllowedUrl={this.onNotAllowedUrl}
					onScroll={this.props.onScroll || function () {}}
				/>
			</View>
		);
	},

	renderAddressBar: function () {
		return (
			<TouchableWithoutFeedback onPress={this.onNotAllowedUrl}>
				<View style={styles.smallAddressBar}>
					<Text style={styles.smallAddressBarText}>{this.state.shortUrl}</Text>
				</View>
			</TouchableWithoutFeedback>
		);

		//return (
		//	<View style={[styles.addressBarRow]}>
		//		<TouchableOpacity onPress={this.goBack}>
		//			<View style={this.state.backButtonEnabled ? styles.navButton : styles.disabledButton}>
		//				<Text>{'<'}</Text>
		//			</View>
		//		</TouchableOpacity>
		//		<TouchableOpacity onPress={this.goForward}>
		//			<View style={this.state.forwardButtonEnabled ? styles.navButton : styles.disabledButton}>
		//				<Text>{'>'}</Text>
		//			</View>
		//		</TouchableOpacity>
		//		<TextInput
		//			ref={TEXT_INPUT_REF}
		//			autoCapitalize="none"
		//			value={this.state.urlInInput}
		//			onSubmitEditing={this.onSubmitEditing}
		//			onChange={this.handleTextInputChange}
		//			clearButtonMode="while-editing"
		//			style={styles.addressBarTextInput}
		//		/>
		//		<TouchableOpacity onPress={this.pressGoButton}>
		//			<View style={styles.goButton}>
		//				<Text>Go!</Text>
		//			</View>
		//		</TouchableOpacity>
		//	</View>
		//);
	},

	componentWillReceiveProps: function (newProps) {
		if (this.state.url !== newProps.url) {
			this.setState({
				url: newProps.url
			});
		}
	},

	cleanupUrl: function (url) {
		url = url.replace(/^(https?\:\/\/)/,'')
			.replace(/^(www\.)/,'')
			.split('/')[0];

		// this is temporary, it should be enabled when we won't use redirect for first load
		// this just hides 'wozniak.io' when first loading process occurrs
		if (url === 'wozniak.io') {
			return 'loading...';
		}

		return url;

	},

	componentDidMount: function () {
		gameStateStore.addChangeListener(this.onGameStateChanged);

		var webView = this.refs[WEBVIEW_REF];
		actions.on(actions.WORDS_READY, webView.prepareWords);
		actions.on(actions.START_GAME, webView.stopScrollTracking);
	},

	onVisibleWordsChanged: function (words) {
		actions.emit(actions.VISITED_WORDS_CHANGED, words);
	},

	onGameStateChanged: function () {
		if (gameStateStore.get('currentState') === gameStateStore.GAME_STATES.WAITING_FOR_ANSWER) {
			if (gameStateStore.get('currentWordIndex') === 0) {
				this.refs[WEBVIEW_REF].setHighlightColor(config.COLORS.BLUE_BG);
			}
		}
	},

	goToUrl: function (url) {
		this.setState({
			urlInInput: url
		});
		this.onSubmitEditing();
	},

	onWordsParsed: function (words) {
		log({
			message: 'words parsed',
			url: this.state.url,
			words: words
		});
		actions.emit(actions.WORDS_PARSED, words);
	},

	goBack: function () {
		this.refs[WEBVIEW_REF].goBack();
	},

	goForward: function () {
		this.refs[WEBVIEW_REF].goForward();
	},

	reload: function () {
		this.props.onUrlChange && this.props.onUrlChange(this.state.url);
		this.refs[WEBVIEW_REF].reload();
	},

	onNavigationStateChange: function (navState) {
		this.setState({
			backButtonEnabled: navState.canGoBack,
			forwardButtonEnabled: navState.canGoForward,
			shortUrl: this.cleanupUrl(navState.url),
			url: navState.url,
			status: navState.title,
			loading: navState.loading,
			urlInInput: navState.url
		});

		//run api only for allowed websites
		//if (WHITELIST.doesMatch(navState.url)) {
			this.scheduleApiInject();
		//}

		if (navState.url !== this.lastUrl) {
			this.lastUrl = navState.url;
			this.refs[WEBVIEW_REF].resetLastParsedContent();
			this.props.onUrlChange && this.props.onUrlChange(navState.url);
		}
	},

	onNotAllowedUrl: function (url) {
		actions.emit(actions.URL_FEATURE_REQUESTED);
	},

	scheduleApiInject: function () {
		clearTimeout(this.apiInjectTimeout);
		this.apiInjectTimeout = setTimeout(function () {
			this.refs[WEBVIEW_REF].injectYarnWebsiteApi();
		}.bind(this), 1000);
	},

	onSubmitEditing: function () {
		this.setState({
			words: []
		});
		this.pressGoButton();
	},

	pressGoButton: function () {
		var url = this.state.urlInInput.toLowerCase();
		log({
			message: 'Page loading started',
			url: url
		});
		if (url === this.state.url) {
			this.reload();
		} else {
			this.setState({
				url: this.state.urlInInput
			});
		}
		// dismiss keyboard
		this.refs[TEXT_INPUT_REF].blur();
	},

	highlightWord: function (word) {
		this.refs[WEBVIEW_REF].highlightWord(word);
	},

	scrollToWord: function (word) {
		this.refs[WEBVIEW_REF].scrollToWord(word);
	},

	unhighlightWords: function () {
		this.refs[WEBVIEW_REF].unhighlightWords();
	},

	goToRandomUrl: function (cb) {
		this.refs[WEBVIEW_REF].goToRandomUrl();
	},

	resetLastParsedContent: function () {
		this.refs[WEBVIEW_REF].resetLastParsedContent();
	},

	ignoreWord: function (word) {
		this.refs[WEBVIEW_REF].ignoreWord(word);
	},

	restoreScroll: function (word) {
		this.refs[WEBVIEW_REF].restoreScroll();
	}
});

var styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: HEADER
	},
	addressBarRow: {
		flexDirection: 'row',
		padding: 8,
		borderBottomWidth: 1,
		borderBottomColor: BORDER,
		height: config.BROWSER_BAR_HEIGHT
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
		fontSize: 14
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
		borderRadius: 3
	},
	disabledButton: {
		width: 20,
		padding: 3,
		marginRight: 3,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: DISABLED_WASH,
		borderColor: 'transparent',
		borderRadius: 3
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
		alignSelf: 'stretch'
	},
	spinner: {
		width: 20,
		marginRight: 6
	},

	smallAddressBar: {
		height: 20,
		borderBottomWidth: 1,
		borderBottomColor: config.COLORS.MID_GREY
	},

	smallAddressBarText: {
		textAlign: 'justify',
		fontSize: 10,
		alignSelf: 'center',
		paddingTop: 3
	}
});
module.exports = Browser;