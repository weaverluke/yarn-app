'use strict';

var React = require('react-native');
var {
	TouchableWithoutFeedback,
	StyleSheet,
	Text,
	View,
	PropTypes
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

	//propTypes: {
	//	index: PropTypes.number.isRequired,
	//	type: PropTypes.oneOf(Object.keys(BUTTON_TYPES)).isRequired,
	//	showDictIcon: PropTypes.bool.isRequired,
	//	text: PropTypes.text.isRequired,
	//	onDictIconPress: PropTypes.func.isRequired,
	//	onAction: PropTypes.func.isRequired
	//},

	render: function () {
		var additionalStyle = {
			backgroundColor: this.getColor('background')
		};
		return (
			<View style={[styles.wrap, additionalStyle]}>
				{this.renderDictIcon()}
				{this.renderButtonContent()}
			</View>
		);
	},

	getColor: function (type) {
		var colorScheme = BUTTON_COLORS[this.props.type] || BUTTON_COLORS.DEFAULT;
		return colorScheme[type] || 'red'; // return red if wrong type passed
	},

	renderDictIcon: function () {
		if (!this.props.showDictIcon) {
			return;
		}

		return (
			<TouchableWithoutFeedback onPress={this.onDictIconPressed}>
				<View style={styles.dictIconWrap}>
				</View>
			</TouchableWithoutFeedback>
		);
	},

	renderButtonContent: function () {
		var buttonContent;
		switch (this.props.type) {
			case BUTTON_TYPES.QUESTION:
				buttonContent = this.renderQuestionButton();
				break;

			case BUTTON_TYPES.ANSWER_ENABLED:
			case BUTTON_TYPES.ANSWER_DISABLED:
				buttonContent = this.renderAnswerButton();
				break;

			case BUTTON_TYPES.CORRECT_ANSWER_SELECTED:
			case BUTTON_TYPES.CORRECT_ANSWER_NOT_SELECTED:
			case BUTTON_TYPES.WRONG_ANSWER_SELECTED:
				buttonContent = this.renderAnswerChangedButton();
				break;

			default:
				buttonContent = <View />;
		}

		if (this.props.showDictIcon) {
			return (
				<View>
					{buttonContent}
				</View>
			);
		}
		else {
			return (
				<TouchableWithoutFeedback onPress={this.onButtonPressed}>
					{buttonContent}
				</TouchableWithoutFeedback>
			);
		}
	},

	renderQuestionButton: function () {
		var nextButton;

		if (this.props.showDictIcon) {
			nextButton = (
				<TouchableWithoutFeedback onPress={this.props.onNextPress}>
					<Text>Next</Text>
				</TouchableWithoutFeedback>
			);
		}

		return (
			<View style={styles.buttonContent}>
				<Text style={styles.questionText}>
					{this.props.text}
				</Text>
				{nextButton}
			</View>
		);
	},

	renderAnswerButton: function () {
		return (
			<View style={styles.buttonContent}>
				<Text style={styles.answerButtonText}>
					{this.props.text}
				</Text>
			</View>
		)
	},

	renderAnswerChangedButton: function () {
		var textColor = this.getColor('text');
		var info;

		if (this.props.type === BUTTON_TYPES.CORRECT_ANSWER_SELECTED ||
			this.props.type === BUTTON_TYPES.WRONG_ANSWER_SELECTED) {

			var infoText = this.props.type === BUTTON_TYPES.CORRECT_ANSWER_SELECTED ? 'That\'s right!' : 'Oops...';
			info = <Text style={[styles.info, {color: this.getColor('info')}]}>{infoText}</Text>;
		}

		return (
			<View style={styles.buttonContent}>
				<Text style={[styles.answerButtonText, {color: textColor}]}>
					{this.props.text}
				</Text>
				{info}
			</View>
		);
	},

	onButtonPressed: function () {
		if (!this.props.showDictIcon) {
			this.props.onAction(this.props.text, this.props.index);
		}
	},

	onDictIconPressed: function () {
		if (this.props.showDictIcon) {
			// todo
		}
	}
});

var styles = StyleSheet.create({

	wrap: {
		borderTopWidth: 1,
		borderTopColor: uiConfig.COLORS.MID_GREY,
		height: uiConfig.QUIZ_BUTTON_HEIGHT,
		flexDirection: 'row',
		alignItems: 'stretch'
	},

	dictIconWrap: {
		width: 40,
		paddingLeft: 10,
		//flex: 1,
		height: uiConfig.QUIZ_BUTTON_HEIGHT,
		backgroundColor: 'green'
	},

	buttonContent: {
		//backgroundColor: 'red',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingLeft: 20,
		flex: 3
	},

	questionText: {
		color: uiConfig.COLORS.BLUE,
		fontFamily: uiConfig.SPECIAL_FONT,
		fontSize: uiConfig.WORD_BUTTON_QUESTION_TEXT_SIZE,
		paddingTop: 5,
		textAlign: 'left',
		flex: 2
	},

	answerButtonText: {
		fontSize: uiConfig.WORD_BUTTON_ANSWER_TEXT_SIZE,
		lineHeight: uiConfig.WORD_BUTTON_ANSWER_TEXT_SIZE,
		textAlign: 'left',
		flex: 2
	},

	info: {
		flex: 1,
		fontWeight: '500',
		textAlign: 'right',
		paddingRight: 20
	}

});

var BUTTON_COLORS = {
	QUESTION: {
		background: uiConfig.COLORS.PALE_BLUE,
		text: uiConfig.COLORS.BLUE
	},

	//ANSWER_ENABLED: {
	//	backgroundColor: uiConfig.COLORS.SELECTED_GREY,
	//	color: '#FFFFFF'
	//},

	//ANSWER_DISABLED: {
	//	backgroundColor: uiConfig.COLORS.MID_GREY,
	//	color: '#FFFFFF'
	//},

	CORRECT_ANSWER_SELECTED: {
		background: uiConfig.COLORS.PALE_GREEN,
		info: uiConfig.COLORS.GREEN
	},

	CORRECT_ANSWER_NOT_SELECTED: {
		background: '#FFF',
		text: uiConfig.COLORS.GREEN
	},

	WRONG_ANSWER_SELECTED: {
		background: uiConfig.COLORS.PALE_PINK,
		info: uiConfig.COLORS.RED
	},

	DEFAULT: {
		background: '#FFF',
		text: uiConfig.COLORS.TEXT,
		info: uiConfig.COLORS.TEXT
	}
};

WordButton.BUTTON_TYPES = BUTTON_TYPES;

module.exports = WordButton;
