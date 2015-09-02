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

var gameSateStore = require('../../stores/gamestatestore');
var YarnWebView = require('./yarnwebview');
var actions = require('../../actions/actions');
var log = require('../../logger/logger');

var BORDER = '#E7EAEA';
var BGWASH = 'rgba(255,255,255,0.8)';
var HEADER = '#F9FAFB';
var DISABLED_WASH = 'rgba(255,255,255,0.25)';

var WEBVIEW_REF = 'webview';
var TEXT_INPUT_REF = 'urlInput';

var Browser = React.createClass({
	lastUrl: '',

	getInitialState: function () {
		return {
			url: this.props.url,
			urlInInput: this.props.url,
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
						value={this.state.urlInInput}
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
				<YarnWebView
					ref={WEBVIEW_REF}
					style={styles.webView}
					userRange={this.props.userRange}
					userLevel={this.props.userLevel}
					url={this.state.url}
					onNavigationStateChange={this.onNavigationStateChange}
					onWordsParsed={this.onWordsParsed}
					onVisibleWordsChanged={this.onVisibleWordsChanged}
					onScroll={this.props.onScroll || function () {}}
				/>
			</View>
		);
	},

	componentDidMount: function () {
		gameSateStore.addChangeListener(this.onGameStateChanged);

		var webView = this.refs[WEBVIEW_REF];
		actions.on(actions.WORDS_READY, webView.prepareWords);
		actions.on(actions.START_GAME, webView.stopScrollTracking);
	},

	onVisibleWordsChanged: function (words) {
		actions.emit(actions.VISITED_WORDS_CHANGED, words);
	},

	onGameStateChanged: function () {
		if (gameSateStore.get('currentState') === gameSateStore.GAME_STATES.WAITING_FOR_ANSWER) {
			var currentWord = gameSateStore.get('currentWord');
			this.highlightWord(currentWord.text);
		}
	},

	onWordsParsed: function (words) {
		log({
			message: 'words parsed',
			url: this.state.url,
			words: words
		});
		actions.emit('WORDS_PARSED', words);
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
		this.setState({
			backButtonEnabled: navState.canGoBack,
			forwardButtonEnabled: navState.canGoForward,
			url: navState.url,
			status: navState.title,
			loading: navState.loading
		});
		if (navState.url !== this.lastUrl) {
			this.lastUrl = navState.url;
			this.refs[WEBVIEW_REF].resetLastParsedContent();
			this.props.onUrlChange && this.props.onUrlChange(navState);
		}
	},

	onSubmitEditing: function (event) {
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

	resetLastParsedContent: function () {
		this.refs[WEBVIEW_REF].resetLastParsedContent();
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
		borderBottomColor: BORDER
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
	}
});
module.exports = Browser;