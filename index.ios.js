'use strict';

var React = require('react-native');

var WordStrip = require('./app/views/wordstrip/wordstrip');
var Browser = require('./app/views/browser/browser');
var Popup = require('./app/views/popup/popup');
var StatusBar = require('./app/views/statusbar/statusbar');
var Settings = require('./app/views/settings/settings');

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

var GAME_STATES = gameStateStore.GAME_STATES;

var BROWSER_REF = 'browser';
var DEFAULT_URL = 'http://www.bbc.co.uk/news/education-24433320';

var yarn = React.createClass({

	getInitialState: function () {
		return {
			url: DEFAULT_URL,
			popupVisible: false,
			question: [],
			buttonRect: {},
			firstButtonRect: {},
			initialPopupVisible: false,
			settingsViewVisible: false,
			bottomBar: ''
		};
	},

	render: function () {
		console.log('render', this.state);
		var bottomBar = this.renderBottomBar();

		return (
			<View style={[styles.container]}>
				<Browser
					ref={BROWSER_REF}
					url={this.state.url}
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

	renderBottomBar: function () {
		switch (this.state.bottomBar) {
			case 'wordscount':
				return this.renderInfoBar();
			case 'wordstrip':
				return this.renderWordStrip();
			case 'result':
				return this.renderResultView();
			default:
				return (<View />);
		}
	},

	renderResultView: function () {
		return (
			<StatusBar
				correctWords={gameStateStore.get('correct')}
				totalWords={gameStateStore.get('pageWords').length}
				onNextPress={this.closeResultView}
				level={userProfileStore.get('level')}
				score={userProfileStore.get('score')}
				showWordsCount={false}
			/>
		);
	},

	renderInfoBar: function () {
		return (
			<StatusBar
				nextText='Test me!'
				onNextPress={actions.emit.bind(actions, actions.START_GAME)}
				showWordsCount={true}
				wordsCount={gameStateStore.get('visitedPageWords').length}
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
			bottomBar: ''
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
			bottomBar: 'wordstrip'
		});
		actions.emit(actions.SHOW_NEXT_QUESTION);
	},

	componentDidMount: function () {
		this.lang = userProfileStore.get('language');

		gameStateStore.addChangeListener(this.onGameStateChanged);
		userProfileStore.addChangeListener(this.onUserProfileChanged);
		actions.on(actions.START_GAME, this.hideBottomBar);
	},

	hideBottomBar: function () {
		this.setState({
			bottomBar: ''
		});
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

		var bottomBar = '';
		var wordStripDisabled = false;

		if (currentGameState === GAME_STATES.NOT_STARTED && gameStateStore.get('pageWords').length) {
			bottomBar = 'wordscount';
		}
		else if (
			currentGameState === GAME_STATES.WAITING_FOR_ANSWER ||
			currentGameState === GAME_STATES.WRONG_ANSWER_CHOSEN ||
			currentGameState === GAME_STATES.CORRECT_ANSWER_CHOSEN ) {
				bottomBar = 'wordstrip';
		}

		if (bottomBar === 'wordstrip') {
			wordStripDisabled = currentGameState !== GAME_STATES.WAITING_FOR_ANSWER;
		}

		var popupVisible = currentGameState === GAME_STATES.CORRECT_ANSWER_CHOSEN ||
				currentGameState === GAME_STATES.WRONG_ANSWER_CHOSEN;

		var popupTitle = popupVisible ?
			(currentGameState == GAME_STATES.CORRECT_ANSWER_CHOSEN ? 'That\'s right!' : 'Oops...') : '';

		var definition;
		(gameStateStore.get('currentQuestion') || []).forEach(function (question) {
			if (question.def) {
				definition = question.def.entryContent
			}
		});

		var initialPopupVisible = this.state.wordstripVisible && gameStateStore.get('currentWordIndex') === 0 &&
				currentGameState === GAME_STATES.WAITING_FOR_ANSWER;

		this.setState({
			question: gameStateStore.get('currentQuestion'),
			wordStripDisabled: wordStripDisabled,
			bottomBar: bottomBar,
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
		this.refs[BROWSER_REF].unhighlightWords();
		this.setState({
			bottomBar: !!gameStateStore.get('pageWords').length ? 'result' : '',
			popupVisible: false,
			infoBarVisible: false,
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

	closeInitialPopup: function () {
		this.setState({
			initialPopupVisible: false
		});
	},

	onUserProfileChanged: function () {
		if (this.lang !== userProfileStore.get('language')) {
			this.lang = userProfileStore.get('language');
			this.refs[BROWSER_REF].resetLastParsedContent();
			this.refs[BROWSER_REF].reload();
			this.setState({
				question: [],
				bottomBar: ''
			});
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
