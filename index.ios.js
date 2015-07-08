'use strict';

var React = require('react-native');

var WordStrip = require('./app/views/wordstrip/wordstrip');
var Browser = require('./app/views/browser/browser');
var googleTranslate = require('./app/helpers/googletranslate');
var gameStateStore = require('./app/stores/gamestatestore');
var actions = require('./app/actions/actions');

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
			question: []
		};
	},

	inputText: '',

	render: function () {
		this.inputText = this.state.url;

		console.log('app', this.showPopup);

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
					highlightWord={this.state.highlightWord}
					highlightWordColor={this.state.highlightWordColor}
				/>
			</View>
		);
	},

	componentDidMount: function () {
		gameStateStore.addChangeListener(this.onGameStateChanged.bind(this));
	},

	onGameStateChanged: function () {
		var currentGameState = gameStateStore.get('currentState');
		var highlightWord = currentGameState !== gameStateStore.GAME_STATES.WAITING_FOR_ANSWER ? gameStateStore.get('chosenAnswer') : false;
		var wordStripDisabled = currentGameState !== gameStateStore.GAME_STATES.WAITING_FOR_ANSWER;

		var highlightWordColor = '';
		if (highlightWord) {
			highlightWordColor = currentGameState === gameStateStore.GAME_STATES.CORRECT_ANSWER_CHOSEN ? '#00FF00' : '#FF0000';
		}

		this.setState({
			question: gameStateStore.get('currentQuestion'),
			highlightWord: highlightWord,
			highlightWordColor: highlightWordColor,
			wordStripDisabled: wordStripDisabled
		});
	},

	onWordPressed: function (rect, word) {
		//this.setState({
		//	popupVisible: true,
		//	buttonRect: rect
		//});

		actions.emit(actions.WORD_PRESSED, word);
	},

	onWordsParsed: function (words) {
		actions.emit(actions.WORDS_PARSED, words);
	}

});

var styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: HEADER,
	}
});


AppRegistry.registerComponent('yarn', () => yarn);
