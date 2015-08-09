'use strict';

var React = require('react-native');

var WordStrip = require('./app/views/wordstrip/wordstrip');
var Browser = require('./app/views/browser/browser');
var Popup = require('./app/views/popup/popup');
var StatusBar = require('./app/views/statusbar/statusbar');
var Result = require('./app/views/result/result');
var Settings = require('./app/views/settings/settings');

var googleTranslate = require('./app/helpers/googletranslate');
var gameStateStore = require('./app/stores/gamestatestore');
var userProfileStore = require('./app/stores/userprofilestore');
var actions = require('./app/actions/actions');

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');
console.log('DIM', width, height);

var {
	AppRegistry,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	WebView
} = React;

var HEADER = '#F9FAFB';

var BROWSER_REF = 'webview';
var DEFAULT_URL = 'http://www.bbc.co.uk/news/education-24433320';

var yarn = React.createClass({

	getInitialState: function () {
		return {
			url: DEFAULT_URL,
			popupVisible: false,
			question: [],
			buttonRect: {},
			firstButtonRect: {},
			wordstripVisible: true,
			// todo: these could be done as binary number and toggle with binary operators
			initialPopupVisible: false,
			resultViewVisible: false,
			settingsViewVisible: false
		};
	},

	inputText: '',

	render: function () {
		this.inputText = this.state.url;

		var bottomBar;
		if (this.state.resultViewVisible) {
			bottomBar = this.renderResultView();
		} else if (this.state.wordstripVisible) {
			bottomBar = this.renderWordStrip();
		}

		return (
			<View style={[styles.container]}>
				<Browser
					ref={BROWSER_REF}
					url={this.state.url}
					onWordsParsed={this.onWordsParsed}
					userLevel={userProfileStore.get('level')}
					userRange={userProfileStore.get('range')}
				/>
				{bottomBar}
				<Popup
					visible={this.state.popupVisible}
					onClose={this.onPopupSubmit}
					onSubmit={this.onPopupSubmit}
					title={this.state.popupTitle}
					content={this.state.popupContent}
					arrowRect={this.state.buttonRect}
				/>
				<Popup
					visible={this.state.initialPopupVisible}
					onClose={this.closeInitialPopup}
					onSubmit={this.closeInitialPopup}
					type={Popup.POPUP_TYPE.INFO}
					arrowRect={this.state.firstButtonRect}
				/>
				{this.renderSettings()}
			</View>
		);
	},

	renderResultView: function () {
		return (
			<StatusBar
				correctWords={gameStateStore.get('correct')}
				totalWords={gameStateStore.get('pageWords').length}
				onNextPress={this.closeResultView}
				level={userProfileStore.get('level')}
				score={userProfileStore.get('score')}
			/>
		);
	},

	renderWordStrip: function () {
		return (
			<WordStrip
				ref='wordstrip'
				disabled={this.state.wordStripDisabled}
				onAction={this.onWordPressed}
				words={this.state.question}
				onSettingsPress={this.showSettings}
			/>
		);
	},

	renderSettings: function () {
		if (!this.state.settingsViewVisible) {
			return (<View />);
		}

		return (
			<Settings
				onClose={this.closeSettingsView}
				initialLang={userProfileStore.get('language')}
			/>
		);

	},

	closeResultView: function () {
		this.setState({
			resultViewVisible: false
		});
	},

	showSettings: function () {
		this.setState({
			settingsViewVisible: true
		});
	},

	closeSettingsView: function () {
		this.setState({
			settingsViewVisible: false
		});
	},

	showNextQuestion: function () {
		this.setState({
			wordstripVisible: true
		});
		actions.emit(actions.SHOW_NEXT_QUESTION);
	},

	componentDidMount: function () {
		this.lang = userProfileStore.get('language');

		gameStateStore.addChangeListener(this.onGameStateChanged.bind(this));
		userProfileStore.addChangeListener(this.onUserProfileChanged.bind(this));
	},

	onPopupSubmit: function () {
		this.setState({
			popupVisible: false
		});
		this.showNextQuestion();
	},

	onGameStateChanged: function () {
		if (gameStateStore.get('finished')) {
			this.finishGame();
			return;
		}

		var currentGameState = gameStateStore.get('currentState');
		var wordStripDisabled = currentGameState !== gameStateStore.GAME_STATES.WAITING_FOR_ANSWER;
		var popupVisible = currentGameState === gameStateStore.GAME_STATES.CORRECT_ANSWER_CHOSEN ||
				currentGameState === gameStateStore.GAME_STATES.WRONG_ANSWER_CHOSEN;

		var popupTitle = popupVisible ?
			(currentGameState == gameStateStore.GAME_STATES.CORRECT_ANSWER_CHOSEN ? 'That\'s right!' : 'Oops...') : '';

		var definition;
		(gameStateStore.get('currentQuestion') || []).forEach(function (question) {
			if (question.def) {
				definition = question.def.entryContent
			}
		});

		var initialPopupVisible = this.state.wordstripVisible &&
				gameStateStore.get('currentWordIndex') === 0 &&
				currentGameState === gameStateStore.GAME_STATES.WAITING_FOR_ANSWER;

		this.setState({
			question: gameStateStore.get('currentQuestion'),
			wordStripDisabled: wordStripDisabled,
			popupVisible: popupVisible,
			popupTitle: popupTitle,
			popupContent: definition,
			initialPopupVisible: initialPopupVisible
		});

		// if initial popup should be shown then we need to measure first button so we'll show arrow for that popup
		// correctly
		if (initialPopupVisible) {
			setTimeout(function () {
				this.refs['wordstrip'].getButtonRect(0, function (rect) {
					this.setState({
						firstButtonRect: rect
					});
				}.bind(this));
			}.bind(this), 300);
		}
	},

	finishGame: function () {
		this.setState({
			resultViewVisible: !!gameStateStore.get('pageWords').length,
			popupVisible: false,
			wordstripVisible: false
		});
	},

	onWordPressed: function (rect, word, index) {
		// first word pressed - just scroll to it
		if (index === 0) {
			this.refs[BROWSER_REF].scrollToWord(word);
			return;
		}

		this.setState({
			buttonRect: rect
		});
		actions.emit(actions.WORD_PRESSED, word);
	},

	onWordsParsed: function (words) {
		var state = this.getInitialState();
		state.url = this.state.url;
		this.setState(state);

		actions.emit(actions.WORDS_PARSED, words);
	},

	closeInitialPopup: function () {
		this.setState({
			initialPopupVisible: false
		});
	},

	onUserProfileChanged: function () {
		if (this.lang !== userProfileStore.get('language')) {
			this.lang = userProfileStore.get('language');
			this.setState({
				question: []
			});
			this.refs[BROWSER_REF].reload();
		}
	}

});

var styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: HEADER
	}
});


AppRegistry.registerComponent('yarn', () => yarn);
