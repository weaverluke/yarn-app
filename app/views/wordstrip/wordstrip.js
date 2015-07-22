'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
} = React;

var WordButton = require('./wordbutton');
var BUTTON_TYPES = WordButton.BUTTON_TYPES;

var TOOLBAR_HEIGHT = 18;

var WordStrip = React.createClass({
	getInitialState: function () {
		return {
			height: TOOLBAR_HEIGHT
		};
	},

	getButtonRect: function (buttonIndex, cb) {
		console.log('wordstrip.getButtonRect()');
		this.refs['button-' + buttonIndex].getButtonRect(cb);
	},

	render: function () {
		//console.log('WordStrip:', this.props.onAction, this.props);
		var wordsToRender = this.prepareWords();

		if (!wordsToRender.length) {
			return (<View/>);
		}

		var words = wordsToRender.map(function (word, i) {
			var type;

			if (i === 0) {
				type = BUTTON_TYPES.QUESTION;
			}
			else if (this.props.disabled) {
				if (word.target) {
					type = word.chosen ? BUTTON_TYPES.CORRECT_ANSWER_SELECTED : BUTTON_TYPES.CORRECT_ANSWER_NOT_SELECTED;
				}
				else if (word.chosen) {
					type = BUTTON_TYPES.WRONG_ANSWER_SELECTED;
				}
				else {
					type = BUTTON_TYPES.ANSWER_DISABLED;
				}
			}
			else {
				type = BUTTON_TYPES.ANSWER_ENABLED;
			}

			return (
				<WordButton 
					height={this.state.height} 
					arrow={i === 1}
					ref={'button-' + i}
					onAction={this.props.type !== BUTTON_TYPES.QUESTION ? this.props.onAction : function () {}}
					text={i === 0 ? word.text : word.definition}
					type={type}
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

		while (words.length) {
			var nextWord = words.pop();
			// if this is target word then copy it on first place in array
			if (nextWord.target) {
				outputWords.unshift(nextWord);
			}
			outputWords.push(nextWord);
		}
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
