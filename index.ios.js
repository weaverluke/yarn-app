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
				<WordStrip onAction={this.onWordPressed} words={this.state.question} />
			</View>
		);
	},

	componentDidMount: function () {
		gameStateStore.addChangeListener(this.onGameStateChanged.bind(this));
	},

	onGameStateChanged: function () {
		this.setState({
			question: gameStateStore.get('currentQuestion')
		});
	},

	onWordPressed: function (rect, word) {
		//fetch('https://www.googleapis.com/language/translate/v2?key=AIzaSyDAjHprVDfX_6z2fAs6Vf03g2sOfEiTogs'+
		//	'&source=en' +
		//	'&target=pl' +
		//	'&q='+word
		//)
		//	.then(function (resp) {
		//		return resp.text();
		//	})
		//	.then(function (respText) {
		//		console.log('TRANSLATE RESP:', respText);
		//	})
		//	.catch(function (err) {
		//		console.log('TRANSLATE ERROR', err)
		//	});


		this.setState({
			popupVisible: true,
			buttonRect: rect
		});
		console.log('highlight word:', word);
		this.refs[BROWSER_REF].highlightWord(word);
	},

	onWordsParsed: function (words) {
		actions.emit(actions.WORDS_PARSED, words);
		//gameStateStore.set('currentWords', words);


		//console.log('onWordsParsed:', words);
		//googleTranslate.translateWords(words, 'en','pl')
		//	.then(function (resp) {
		//		console.log('TRANSLATION COMPLETE', resp);
		//	})
		//	.catch(function (ex) {
		//		console.log('TRANSLATE ERROR' ,ex);
		//	});

		this.setState({
			words: words
		});
	}

});

var styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: HEADER,
	}
});


AppRegistry.registerComponent('yarn', () => yarn);
