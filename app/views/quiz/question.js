'use strict';

var React = require('react-native');
var {
	StyleSheet,
	ScrollView,
	View,
	Animated
} = React;

var uiConfig = require('../../uiconfig');
var WordButton = require('./wordbutton');
var BUTTON_TYPES = WordButton.BUTTON_TYPES;

var Question = React.createClass({

	componentWillReceiveProps: function (newProps) {
		var wordsWillChange = newProps.words && newProps.words[0] &&
			this.props.words && this.props.words[0] &&
			newProps.words[0].text !== this.props.words[0].text;

		this.setState({
			scrollToStart: wordsWillChange
		});
	},

	getButtonRect: function (buttonIndex, cb) {
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
					index={i}
					key={'word-' + i}
					showDictIcon={this.props.disabled}
					onAction={this.props.type !== BUTTON_TYPES.QUESTION ? this.props.onAction : function () {}}
					onNextPress={this.props.onNextPress}
					onDictIconPressed={this.onDictIconPressed}
					text={i === 0 ? word.text : word.definition}
					type={type}
				/>
			);

		}.bind(this));

		return (
			<Animated.View>
				{words}
			</Animated.View>
		);

	},

	onDictIconPressed: function (text) {
		this.props.onShowDictionary(text);
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
		backgroundColor: uiConfig.COLORS.SELECTED_GREY,
		flexDirection: 'row'
	},

	words: {
		flex: 1,
		flexDirection: 'row'
	}

});

module.exports = Question;