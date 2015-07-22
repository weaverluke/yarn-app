'use strict';

var React = require('react-native');

var WordStrip = require('./app/views/wordstrip/wordstrip');
var Browser = require('./app/views/browser/browser');
var Popup = require('./app/views/popup/popup');
var googleTranslate = require('./app/helpers/googletranslate');
var gameStateStore = require('./app/stores/gamestatestore');
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
			initialPopupVisible: false,
			question: [],
			buttonRect: {}
		};
	},

	inputText: '',

	render: function () {
		this.inputText = this.state.url;
		console.log('App.render()', this.state);

		var firstButtonRect = {
			x: 0,
			width: 70
		};

		return (
			<View style={[styles.container]}>
				<Browser
					ref={BROWSER_REF}
					url={this.state.url}
					onWordsParsed={this.onWordsParsed}
				/>
				<WordStrip
					disabled={this.state.wordStripDisabled}
					onAction={this.onWordPressed}
					words={this.state.question}
				/>
				<Popup
					visible={this.state.popupVisible}
					onClose={this.onPopupClose}
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
					arrowRect={firstButtonRect}
				/>
			</View>
		);
	},

	componentDidMount: function () {
		gameStateStore.addChangeListener(this.onGameStateChanged.bind(this));
	},

	onPopupClose: function () {
		this.setState({
			popupVisible: false
		});
		// this one should show status bar, but for now let's just continue game
		actions.emit(actions.SHOW_NEXT_QUESTION);
	},

	onPopupSubmit: function () {
		this.setState({
			popupVisible: false
		});
		actions.emit(actions.SHOW_NEXT_QUESTION);
	},

	onGameStateChanged: function () {
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

		var initialPopupVisible = gameStateStore.get('currentWordIndex') === 0 &&
				currentGameState === gameStateStore.GAME_STATES.WAITING_FOR_ANSWER;

		this.setState({
			question: gameStateStore.get('currentQuestion'),
			wordStripDisabled: wordStripDisabled,
			popupVisible: popupVisible,
			popupTitle: popupTitle,
			popupContent: definition,
			initialPopupVisible: initialPopupVisible
		});
	},

	onWordPressed: function (rect, word) {
		console.log('onWordPressed', rect, word);
		this.setState({
		//	popupVisible: true,
			buttonRect: rect
		});
		actions.emit(actions.WORD_PRESSED, word);
	},

	onWordsParsed: function (words) {
		actions.emit(actions.WORDS_PARSED, words);
	},

	closeInitialPopup: function () {
		this.setState({
			initialPopupVisible: false
		});
	}

});

var styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: HEADER
	}
});


AppRegistry.registerComponent('yarn', () => yarn);
