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
var SCORE_ANIMATION_TIME = 1500;

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
			topOffsetValue: new Animated.Value(height - uiConfig.TOOLBAR_HEIGHT),
			score: 0,
			levelBackground: uiConfig.COLORS.ORANGE
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
						<Text style={[styles.text, styles.blueText]}>{this.state.score}</Text>
					</View>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<Text style={[styles.text, styles.orangeText]}>Vocab level</Text>
					</View>
					<View style={[styles.rowValue, styles.orangeBg, {
						backgroundColor: this.state.levelBackground
					}]}>
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
		setTimeout(this.animateStats, 500);
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

	animateStats: function () {
		this.animateScore();
		this.animateLevel();
	},

	animateScore: function () {

		var startDate = Date.now();

		var next = function () {

			setTimeout(function () {
				var elapsedTime = Date.now() - startDate;
				var currentProgress = Math.min(elapsedTime / SCORE_ANIMATION_TIME, 1);
				var easeValue = ease(currentProgress, elapsedTime, 0, 1, SCORE_ANIMATION_TIME);

				var newScore = Math.round(this.props.score * easeValue);
				if (this.state.score === newScore) {
					newScore++;
				}

				this.setState({
					score: newScore
				});

				if (currentProgress !== 1) {
					next();
				}

			}.bind(this), 30);

		}.bind(this);

		next();
	},

	animateLevel: function () {


		function animateColor(start, end, progress) {
			return {
				r: colorEase(start.r, end.r, progress),
				g: colorEase(start.g, end.g, progress),
				b: colorEase(start.b, end.b, progress)
			};
		}

		function colorEase(a,b,u) {
			return parseInt((1-u) * a + u * b);
		}

		function toCssColor(color) {
			return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
		}

		var animationTime = SCORE_ANIMATION_TIME / 4;

		var fade = function (start, end, duration, callback) {
			var startTime = Date.now();

			var fadeStep = function () {
				var currentState = Math.min((Date.now() - startTime) / duration, 1);
				var color = animateColor(start, end, currentState);

				this.setState({
					levelBackground: toCssColor(color)
				});

				if (currentState === 1) {
					callback && callback();
				}
				else {
					setTimeout(fadeStep, 30);
				}
			}.bind(this);

			fadeStep();

		}.bind(this);


		var color1 = {
			r: 247,
			g: 148,
			b: 30
		};
		var color2 = {
			r: 248,
			g: 187,
			b: 43
		};

		// color1 > color 2 > wait 100ms > color 1
		setTimeout(function () {
			fade(color1, color2, animationTime, function() {
				setTimeout(fade, 100, color2, color1, animationTime);
			});
		}, animationTime);
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

// ease out quad
function ease(x, t, b, c, d) {
	return -c *(t/=d)*(t-2) + b;
}

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
