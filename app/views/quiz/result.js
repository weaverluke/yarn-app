'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	Image,
	Animated,
	Easing
} = React;

var QuizResult = require('./quizresult');

var ANIMATION_TIME = 300;

var uiConfig = require('../../uiconfig');

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');

var ResultView = React.createClass({

	getDefaultProps: function () {
		return {
			correctWords: 0,
			totalWords: 0,
			onDonePressed: function () {},
			onRandomPressed: function () {},
			level: 0,
			score: 0,
			showWordsCount: false
		};
	},

	getInitialState: function () {
		return {
			topOffsetValue: new Animated.Value(height - uiConfig.TOOLBAR_HEIGHT)
		};
	},

	render: function () {
		var animationStyle = {
			transform: [
				{ translateY: this.state.topOffsetValue }
			]
		};

		return (
			<Animated.View style={[styles.wrap, animationStyle]}>
				<View style={[styles.row, styles.transparentBg]}>
					<View style={styles.headerWrap}>
						<Text style={styles.headerText}>Quiz completed</Text>
					</View>
				</View>

				<QuizResult
					correctWords={this.props.correctWords}
					totalWords={this.props.totalWords}
				/>

				<Spacer />

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<Text style={[styles.text, styles.blueText]}>Score</Text>
					</View>
					<View style={[styles.rowValue, styles.paleBlueBg]}>
						<Text style={[styles.text, styles.blueText]}>{this.props.score}</Text>
					</View>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<Text style={[styles.text, styles.orangeText]}>Vocab level</Text>
					</View>
					<View style={[styles.rowValue, styles.orangeBg]}>
						<Text style={[styles.text, styles.whiteText]}>{this.props.level}</Text>
					</View>
				</View>

				<Stretch />

				<View style={styles.row}>
					<TouchableWithoutFeedback onPress={this.hide(this.props.onDonePressed)}>
						<View style={[styles.button, styles.greyBg]}>
							<Text style={styles.buttonText}>Done</Text>
						</View>
					</TouchableWithoutFeedback>
					<TouchableWithoutFeedback onPress={this.hide(this.props.onRandomPressed)}>
						<View style={[styles.button, styles.blueBg]}>
							<Text style={styles.buttonText}>Random!</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>

			</Animated.View>
		);
	},

	componentDidMount: function () {
		// delay intro animation a bit to make it smooth
		setTimeout(this.animateIn, 150);
	},

	animateIn: function () {
		Animated.parallel([
			Animated.timing(
				this.state.topOffsetValue,
				{ toValue: 0, duration: ANIMATION_TIME, easing: Easing.in }
			)
		]).start();
	},

	animateOut: function (cb) {
		Animated.parallel([
			Animated.timing(
				this.state.topOffsetValue,
				{ toValue: height, duration: ANIMATION_TIME }
			)
		]).start(cb);
	},

	hide: function (cb) {
		return function () {
			this.animateOut(cb)
		}.bind(this);
	}

});

var Spacer = React.createClass({
	render: function () {
		return <View style={styles.spacer} />;
	}
});

var Stretch = React.createClass({
	render: function () {
		return <View style={styles.stretch} />;
	}
});

var styles = StyleSheet.create({

	wrap: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		alignItems: 'stretch',
		flex: 1,
		backgroundColor: uiConfig.COLORS.LIGHT_GREY
	},

	spacer: {
		height: uiConfig.TOOLBAR_HEIGHT,
		backgroundColor: 'transparent',
		borderBottomWidth: 1,
		borderBottomColor: uiConfig.COLORS.MID_GREY
	},

	stretch: {
		height: uiConfig.TOOLBAR_HEIGHT,
		backgroundColor: 'transparent',
		flex: 1
	},

	row: {
		height: uiConfig.TOOLBAR_HEIGHT,
		backgroundColor: 'white',
		flexDirection: 'row',
		alignItems: 'stretch',
		borderBottomWidth: 1,
		borderBottomColor: uiConfig.COLORS.MID_GREY
	},

	text: {
		fontFamily: uiConfig.SPECIAL_FONT,
		fontSize: 30,
		lineHeight: 40,
		backgroundColor: 'transparent'
	},

	rowLabel: {
		flex: 1,
		paddingLeft: 20
	},

	rowValue: {
		alignItems: 'center',
		width: 100
	},

	blueBg: {
		backgroundColor: uiConfig.COLORS.BLUE
	},

	paleBlueBg: {
		backgroundColor: uiConfig.COLORS.PALE_BLUE
	},

	orangeBg: {
		backgroundColor: uiConfig.COLORS.ORANGE
	},

	greyBg: {
		backgroundColor: uiConfig.COLORS.SELECTED_GREY
	},

	transparentBg: {
		backgroundColor: 'transparent'
	},

	blueText: {
		color: uiConfig.COLORS.BLUE
	},

	orangeText: {
		color: uiConfig.COLORS.ORANGE
	},

	whiteText: {
		color: 'white'
	},

	button: {
		flex: 1,
		alignItems: 'center'
	},

	buttonText: {
		fontFamily: uiConfig.SPECIAL_FONT,
		fontSize: 24,
		lineHeight: 38,
		backgroundColor: 'transparent',
		color: 'white'
	},

	headerWrap: {
		flex: 1,
		alignItems: 'center'
	},

	headerText: {
		fontSize: 18,
		lineHeight: 36,
		fontWeight: '500',
		justifyContent: 'center',
		color: uiConfig.COLORS.TEXT
	}

});

module.exports = ResultView;
