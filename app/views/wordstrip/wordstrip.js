'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
} = React;

var WordButton = require('./wordbutton');

var TOOLBAR_HEIGHT = 18;

var WordStrip = React.createClass({
	getInitialState: function () {
		return {
			height: TOOLBAR_HEIGHT
		};
	},

	render: function () {
		console.log('WordStrip:', this.props.onAction, this.props.words);
		var wordsToRender = this.prepareWords();

		if (!wordsToRender.length) {
			return (<View/>);
		}

		//var words = (this.props.words || []).map(function (word, i) {
		var words = wordsToRender.map(function (word, i) {
			return (
				<WordButton 
					height={this.state.height} 
					arrow={i == 0}
					onAction={this.props.onAction}
					text={word}
				/>
			);
		}.bind(this));

		return (
			<View style={styles.toolbar}>
				{words}
			</View>
		);
	},

	prepareWords: function () {
		if (!this.props.words || !this.props.words.length) {
			return [];
		}

		var words = JSON.parse(JSON.stringify(this.props.words));
		var outputWords = [];

		// shuffle words
		words.sort(function () {
			return Math.random() < 0.5;
		});

		while (words.length) {
			var nextWord = words.pop();
			if (nextWord.target) {
				outputWords.unshift(nextWord.text);
			}
			outputWords.push(nextWord.definition);
		}
		console.log('wordstrip words', outputWords);
		return outputWords;
	}
});

var styles = StyleSheet.create({

	toolbar: {
		backgroundColor: '#777777',
		flexDirection: 'row'
	}

});

module.exports = WordStrip;
