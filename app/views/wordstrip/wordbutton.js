'use strict';

var React = require('react-native');
var {
	TouchableWithoutFeedback,
	StyleSheet,
	Text,
	View,
} = React;

var uiConfig = require('../../uiconfig');
var FIRST_BUTTON_ARROW_SIZE = 10;

var BUTTON_TYPES = {
	QUESTION: 'QUESTION',
	ANSWER_ENABLED: 'ANSWER_ENABLED',
	ANSWER_DISABLED: 'ANSWER_DISABLED',
	CORRECT_ANSWER_SELECTED: 'CORRECT_ANSWER_SELECTED',
	CORRECT_ANSWER_NOT_SELECTED: 'CORRECT_ANSWER_NOT_SELECTED',
	WRONG_ANSWER_SELECTED: 'WRONG_ANSWER_SELECTED'
};

var WordButton = React.createClass({

	render: function () {
		var arrow;
		var height = this.props.height;

		var buttonColors = BUTTON_COLORS[this.props.type] || {};

		var additionalStyle = {
			height: height,
			backgroundColor: buttonColors.backgroundColor
		};

		var additionalTextStyle = {
			lineHeight: height * 0.7
		};

		if (this.props.arrow) {
			arrow = (
				<View style={[styles.buttonArrow, {
					borderTopWidth: height/2,
					borderBottomWidth: height/2
				}]}></View>
			);
			// adjust text padding for button with arrow
			additionalTextStyle.paddingLeft = uiConfig.WORDBUTTON_PADDING - FIRST_BUTTON_ARROW_SIZE/4;
		}

		if (this.props.type !== BUTTON_TYPES.QUESTION) {
			additionalStyle.borderRightWidth = 1;
			additionalStyle.borderRightColor = '#FFFFFF';
		}

		return (
			<TouchableWithoutFeedback onPress={this.onButtonPressed}>
				<View ref='button' style={[styles.wordButton, additionalStyle]}>
					{arrow}
					<Text style={[styles.wordButtonText, additionalTextStyle, buttonColors]}>
						{this.props.text}
					</Text>
				</View>
			</TouchableWithoutFeedback>
		);
	},

	getButtonRect: function (cb) {
		this.refs.button.measure(function (ox, oy, width, height, px, py) {
			cb({
				x: px,
				y: py,
				width: width,
				height: height
			});
		});
	},

	onButtonPressed: function () {
		this.getButtonRect(function (rect) {
			this.props.onAction(rect, this.props.text, this.props.index);
		}.bind(this));
		//console.log('onAction', this.props.onAction);
		//this.refs.button.measure(function (ox, oy, width, height, px, py) {
		//	this.props.onAction({
		//		x: px,
		//		y: py,
		//		width: width,
		//		height: height
		//	}, this.props.text);
		//}.bind(this));
	}
});

var styles = StyleSheet.create({

	wordButton: {
		flexDirection: 'row'
	},

	wordButtonText: {
		paddingLeft: uiConfig.WORDBUTTON_PADDING,
		paddingRight: uiConfig.WORDBUTTON_PADDING,
		fontSize: uiConfig.TOOLBAR_FONT_SIZE,
		fontWeight: '500'
	},

	buttonArrow: {
		width: FIRST_BUTTON_ARROW_SIZE,
		borderLeftWidth: Math.ceil(FIRST_BUTTON_ARROW_SIZE/2),
		borderTopColor: 'rgba(0,0,0,0)',
		borderBottomColor: 'rgba(0,0,0,0)',
		backgroundColor: 'rgba(0,0,0,0)',
		borderLeftColor: uiConfig.COLORS.LIGHT_GREY
	}

});

var BUTTON_COLORS = {
	QUESTION: {
		backgroundColor: uiConfig.COLORS.LIGHT_GREY,
		color: uiConfig.COLORS.TEXT
	},

	ANSWER_ENABLED: {
		backgroundColor: uiConfig.COLORS.SELECTED_GREY,
		color: '#FFFFFF'
	},

	ANSWER_DISABLED: {
		backgroundColor: uiConfig.COLORS.MID_GREY,
		color: '#FFFFFF'
	},

	CORRECT_ANSWER_SELECTED: {
		backgroundColor: uiConfig.COLORS.GREEN,
		color: '#FFFFFF'
	},

	CORRECT_ANSWER_NOT_SELECTED: {
		backgroundColor: uiConfig.COLORS.LIGHT_GREY,
		color: '#41AC60'
	},

	WRONG_ANSWER_SELECTED: {
		backgroundColor: uiConfig.COLORS.RED,
		color: '#FFFFFF'
	}
};

WordButton.BUTTON_TYPES = BUTTON_TYPES;

module.exports = WordButton;
