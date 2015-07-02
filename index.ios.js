'use strict';

var React = require('react-native');

var WordStrip = require('./app/views/wordstrip/wordstrip');
var Browser = require('./app/views/browser/browser');

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
			words: []
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
				<WordStrip onAction={this.onWordPressed} words={this.state.words} />
			</View>
		);
	},

	onWordPressed: function (rect, word) {
		this.setState({
			popupVisible: true,
			buttonRect: rect
		});
		console.log('highlight word:', word);
		this.refs[BROWSER_REF].highlightWord(word);
	},

	onWordsParsed: function (words) {
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
