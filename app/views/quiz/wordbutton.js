'use strict';

var React = require('react-native');
var {
	TouchableHighlight,
	TouchableWithoutFeedback,
	StyleSheet,
	Text,
	View,
	Image,
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
	//	hasDictionaryDefinition: PropTypes.bool.isRequired,
	//	text: PropTypes.text.isRequired,
	//	onDictIconPress: PropTypes.func.isRequired,
	//	onAction: PropTypes.func.isRequired
	//},

	nextTimeout: 0,

	getInitialState: function () {
		return {
			timeoutAnimationEnabled: true
		}
	},

	render: function () {
		var additionalStyle = {
			backgroundColor: this.getColor('background')
		};
		var clickCallback = this.props.showDictIcon ? this.onDictIconPressed : this.onButtonPressed;
		return (
			<View style={[styles.wrap, additionalStyle]}>
				<TouchableHighlight onPress={clickCallback} underlayColor={'rgb(238, 248, 253)'}>
					<View style={styles.buttonContentWrap}>
						{this.renderDictIcon()}
						{this.renderButtonContent()}
						{this.renderInfoText()}
					</View>
				</TouchableHighlight>
			</View>
		);
	},

	componentWillReceiveProps: function (props) {
		if (this.props.type === BUTTON_TYPES.QUESTION && this.props.text !== props.text) {
			this.startTimeoutAnimation();
		}
	},

	getColor: function (type) {
		var colorScheme = BUTTON_COLORS[this.props.type] || BUTTON_COLORS.DEFAULT;
		return colorScheme[type] || 'red'; // return red if wrong type passed
	},

	renderDictIcon: function () {
		if (!this.props.showDictIcon) {
			return (<View style={styles.leftSpace}></View>);
		}

		var opacity = {
			// no support for checking availability atm, so all icons have opacity set to 1
			//opacity: this.props.hasDictionaryDefinition ? 1 : 0.3
			opacity: 1
		};

		return (
			<View style={styles.dictIconWrap}>
				<View style={styles.vCenter}>
					<Image source={require('image!magnifier')} style={[styles.dictIcon, opacity]}/>
				</View>
			</View>
		);
	},

	renderInfoText: function () {
		if (this.props.type === BUTTON_TYPES.CORRECT_ANSWER_SELECTED ||
			this.props.type === BUTTON_TYPES.WRONG_ANSWER_SELECTED) {

			var infoText = this.props.type === BUTTON_TYPES.CORRECT_ANSWER_SELECTED ? 'That\'s right!' : 'Oops...';

			return (
				<Text style={[styles.info, {color: this.getColor('info')}]}>{infoText}</Text>
			);
		}
	},

	renderButtonContent: function () {
		if (this.props.type === BUTTON_TYPES.QUESTION) {
			return this.renderQuestionButton();
		}
		else {
			return this.renderAnswerButton();
		}
	},

	renderQuestionButton: function () {
		var nextButton;
		var iconUri = this.state.timeoutAnimationEnabled ? 'next-anim-5s.gif' : 'next-finished.gif';

		if (this.props.showDictIcon) {
			nextButton = (
				<TouchableHighlight onPress={this.props.onNextPress}>
					<View style={styles.nextIconWrap}>
						<View style={styles.vCenter}>
							<Image source={{uri: iconUri}} style={styles.nextIcon}/>
						</View>
					</View>
				</TouchableHighlight>
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
		var textColor = this.getColor('text');

		return (
			<View style={styles.buttonContent}>
				<Text style={[styles.answerButtonText, {color: textColor}]}>
					{this.props.text}
				</Text>
			</View>
		)
	},

	onButtonPressed: function () {
		if (!this.props.showDictIcon) {
			// timeout to make highlight animation working correctly
			setTimeout(function () {
				this.props.onAction(this.props.text, this.props.index);
			}.bind(this), 150);
		}
	},

	onDictIconPressed: function () {
		if (this.props.showDictIcon) {
			this.props.onDictIconPressed(this.props.text, this.props.hasDictionaryDefinition);
		}
	},

	stopTimeoutAnimation: function () {
		if (this.state.timeoutAnimationEnabled) {
			this.setState({
				timeoutAnimationEnabled: false
			});
		}
	},

	startTimeoutAnimation: function () {
		if (!this.state.timeoutAnimationEnabled) {
			this.setState({
				timeoutAnimationEnabled: true
			});
		}
	}
});

var styles = StyleSheet.create({

	wrap: {
		borderTopWidth: 1,
		borderTopColor: uiConfig.COLORS.MID_GREY,
		alignItems: 'stretch',
		alignSelf: 'stretch',
		flex: 1
	},

	buttonContentWrap: {
		flexDirection: 'row',
		flex: 1,
		height: uiConfig.QUIZ_BUTTON_HEIGHT
	},

	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1
	},

	questionText: {
		color: uiConfig.COLORS.BLUE,
		fontFamily: uiConfig.SPECIAL_FONT,
		fontSize: uiConfig.WORD_BUTTON_QUESTION_TEXT_SIZE,
		paddingTop: 5,
		flex: 1
	},

	answerButtonText: {
		fontSize: uiConfig.WORD_BUTTON_ANSWER_TEXT_SIZE,
		lineHeight: uiConfig.WORD_BUTTON_ANSWER_TEXT_SIZE,
		flex: 1
	},

	info: {
		fontWeight: '500',
		textAlign: 'right',
		paddingRight: 20,
		alignSelf: 'center'
	},

	dictIconWrap: {
		width: 40,
		height: uiConfig.QUIZ_BUTTON_HEIGHT,
		alignSelf: 'stretch',
		flexDirection: 'row'
	},

	dictIcon: {
		width: 18,
		height: 18
	},

	nextIconWrap: {
		backgroundColor: uiConfig.COLORS.BLUE,
		width: 70,
		height: uiConfig.QUIZ_BUTTON_HEIGHT,
		alignSelf: 'stretch',
		flexDirection: 'row'
	},

	nextIcon: {
		width: 34,
		height: 34
	},

	vCenter: {
		alignSelf: 'stretch',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		flex: 1
	},

	leftSpace: {
		width: 20
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
		text: uiConfig.COLORS.TEXT,
		info: uiConfig.COLORS.GREEN
	},

	CORRECT_ANSWER_NOT_SELECTED: {
		background: '#FFF',
		text: uiConfig.COLORS.GREEN
	},

	WRONG_ANSWER_SELECTED: {
		background: uiConfig.COLORS.PALE_PINK,
		text: uiConfig.COLORS.TEXT,
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
