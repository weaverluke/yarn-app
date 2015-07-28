'use strict';

var React = require('react-native');
var {
	TouchableWithoutFeedback,
	StyleSheet,
	Text,
	View,
} = React;

var uiConfig = require('../../uiconfig');

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
		//console.log('WordButton.render()', this.props);

		var arrow;
		var height = this.props.height;
		var additionalStyle = {
			height: height
		};

		if (this.props.arrow) {
			arrow = (
				<View style={[styles.buttonArrow, {
					borderTopWidth: height/2,
					borderBottomWidth: height/2
				}]}></View>
			);
		}

		if (this.props.type !== BUTTON_TYPES.QUESTION) {
			additionalStyle.borderRightWidth = 1;
			additionalStyle.borderRightColor = '#FFFFFF';
		}

		var buttonColors = styles[this.props.type] || {};

		return (
			<TouchableWithoutFeedback onPress={this.onButtonPressed}>
				<View ref="button" style={[styles.wordButton, additionalStyle, buttonColors]}>
					{arrow}
					<Text style={[styles.wordButtonText, {lineHeight: height * 0.7}, buttonColors]}>
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
			this.props.onAction(rect, this.props.text);
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
		paddingLeft: 10,
		paddingRight: 10,
		fontSize: uiConfig.TOOLBAR_FONT_SIZE,
		fontWeight: '500'
	},

	buttonArrow: {
		width: 5,
		borderTopColor: 'rgba(0,0,0,0)',
		borderBottomColor: 'rgba(0,0,0,0)',
		borderLeftWidth: 3,
		backgroundColor: 'rgba(0,0,0,0)',
		borderLeftColor: '#F2F2F2'
	},

	QUESTION: {
		backgroundColor: '#F2F2F2',
		color: '#414042'
	},

	ANSWER_ENABLED: {
		backgroundColor: '#787878',
		color: '#FFFFFF'
	},

	ANSWER_DISABLED: {
		backgroundColor: '#BEBEBE',
		color: '#FFFFFF'
	},

	CORRECT_ANSWER_SELECTED: {
		backgroundColor: '#41AC60',
		color: '#FFFFFF'

	},

	CORRECT_ANSWER_NOT_SELECTED: {
		backgroundColor: '#F2F2F2',
		color: '#41AC60'
	},

	WRONG_ANSWER_SELECTED: {
		backgroundColor: '#DF1C24',
		color: '#FFFFFF'

	}
});

WordButton.BUTTON_TYPES = BUTTON_TYPES;

module.exports = WordButton;
