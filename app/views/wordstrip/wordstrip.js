'use strict';

var React = require('react-native');
var {
	StyleSheet,
	ScrollView,
	View,
} = React;

var uiConfig = require('../../uiconfig');
var WordButton = require('./wordbutton');
var NavbarButton = require('../navbar/navbarbutton');
var BUTTON_TYPES = WordButton.BUTTON_TYPES;

var WordStrip = React.createClass({
	getInitialState: function () {
		return {
			height: uiConfig.TOOLBAR_HEIGHT
		};
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

		console.log('wordsToRender', wordsToRender);
		console.trace();
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
				<ScrollView
					horizontal={true}
					showsHorizontalScrollIndicator={false}
				>
					<View style={styles.words}>
						{words}
					</View>
					<NavbarButton
						onPress={this.props.onSettingsPress}
						icon={'settings'}
					/>
				</ScrollView>
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
		backgroundColor: uiConfig.COLORS.SELECTED_GREY,
		flexDirection: 'row'
	},

	words: {
		flex: 1,
		flexDirection: 'row'
	}

});

module.exports = WordStrip;
