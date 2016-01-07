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
var Popup = require('../popup/popup');
var ToolbarRandomButton = require('../randommenu/toolbarrandombutton');

var ANIMATION_TIME = 300;
var SCORE_ANIMATION_TIME = 1500;

var uiConfig = require('../../uiconfig');
var utils = require('../../utils');

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');

var ResultView = React.createClass({

	getDefaultProps: function () {
		return {
			correctWords: 0,
			totalWords: 0,
			onDonePressed: function () {},
			onRandomPressed: function () {},
			onBuyVocabLevelPressed: function () {},
			level: 0,
			previousLevel: 0,
			score: 0,
			previousScore: 0,
			showWordsCount: false,
			buyVocabLevelShown: false,
			buyVocabLevelPressed: false
		};
	},

	getInitialState: function () {
		return {
			topOffsetValue: new Animated.Value(height - uiConfig.TOOLBAR_HEIGHT),
			score: this.props.score === this.props.previousScore ? this.props.score : this.props.previousScore,
			level: this.props.level === this.props.previousLevel ? this.props.level : this.props.previousLevel,
			levelBackground: uiConfig.COLORS.ORANGE,
			buyVocabLevelPopupVisible: this.props.buyVocabLevelShown
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
					onAnimationEnd={this.animateStats}
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
						<Text style={[styles.text, styles.whiteText]}>{this.state.level}</Text>
					</View>
				</View>

				<Stretch />

				<View style={[styles.row, styles.lastRow]}>
					<ToolbarRandomButton />
				</View>

				<Popup
					visible={this.state.buyVocabLevelPopupVisible}
					type={Popup.POPUP_TYPE.BUY_VOCAB_LEVEL}
					withoutOverlay={true}
					buyButtonInFinalState={this.props.buyVocabLevelPressed}
					onBuyPressed={this.props.onBuyVocabLevelPressed}
				/>

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

	animateStats: function () {
		this.animateScore(function () {
			setTimeout(this.animateLevel, 500);
		}.bind(this));
	},

	animateScore: function (cb) {
		if (this.props.score !== this.props.previousScore) {
			utils.animateNumber({
				start: this.props.previousScore,
				end: this.props.score,
				duration: SCORE_ANIMATION_TIME,
				onChange: function (val) {
					this.setState({
						score: val
					});
				}.bind(this),
				onFinish: cb
			});
		}
		else {
			cb();
		}
	},

	animateLevel: function () {
		// do not animate level if it hasn't changed
		if (this.props.level !== this.props.previousLevel) {
			this.animateLevelNumber(this.animateLevelBackground.bind(this, this.showBuyVocabLevelPopup));
		}
		else {
			this.showBuyVocabLevelPopup();
		}
	},

	animateLevelNumber: function (cb) {
		console.log('ANIMATE LEVEL NUMBER', this.props.previousLevel, this.props.level);

		utils.animateNumber({
			start: this.props.previousLevel,
			end: this.props.level,
			duration: SCORE_ANIMATION_TIME,
			onChange: function (val) {
				this.setState({
					level: val
				});
			}.bind(this),
			onFinish: cb
		});
	},

	animateLevelBackground: function (cb) {
		var startColor = utils.colorToObj(uiConfig.COLORS.ORANGE);
		var endColor = utils.colorToObj(uiConfig.COLORS.LIGHT_ORANGE);
		utils.animateColor({
			start: startColor,
			end: endColor,
			duration: SCORE_ANIMATION_TIME/4,
			onChange: function (color) {

			}.bind(this),
			onFinish: function () {

				utils.animateColor({
					start: endColor,
					end: startColor,
					duration: SCORE_ANIMATION_TIME/4,
					onChange: function (color) {
						this.setState({
							levelBackground: utils.colorToString(color)
						});
					}.bind(this),
					onFinish: cb
				});

			}.bind(this)
		});
	},

	hide: function (cb) {
		return function () {
			this.animateOut(cb)
		}.bind(this);
	},

	showBuyVocabLevelPopup: function () {
		if (this.props.level === uiConfig.MAX_VOCAB_LEVEL) {

			this.setState({
				levelBackground: uiConfig.COLORS.RED,
				level: uiConfig.MAX_VOCAB_LEVEL + '+'
			});

			setTimeout(function () {
				this.setState({
					buyVocabLevelPopupVisible: true
				});
			}.bind(this), 2500);
		}
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

	lastRow: {
		borderBottomWidth: 0,
		marginTop: 3, // so shadow is visible
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 1
		},
		shadowOpacity: 0.5,
		shadowRadius: 1
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
		fontSize: 30,
		lineHeight: 42,
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
	},

	buttonWithImage: {
		flexDirection: 'row',
		justifyContent: 'center'
	},

	randomIcon: {
		width: uiConfig.TOOLBAR_ICON_SIZE + 8,
		height: uiConfig.TOOLBAR_ICON_SIZE + 8,
		marginRight: 10,
		marginBottom: -2
	}
});

module.exports = ResultView;
