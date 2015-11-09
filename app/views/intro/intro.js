'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	TouchableHighlight,
	Image,
	Animated
} = React;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');

var actions = require('../../actions/actions');
var uiConfig = require('../../uiconfig');
var LangPicker = require('../langpicker/langpicker');

var MainBar = React.createClass({

	getInitialState: function () {
		return {
			opacityValue: new Animated.Value(1),
			marginTopValue: new Animated.Value(0),
			lang: this.props.lang,
			guardianInfoViewVisible: false
		};
	},

	render: function () {
		return (
			<Animated.View style={[styles.wrap, {
				transform: [
					{ translateY: this.state.marginTopValue }
				],
				opacity: this.state.opacityValue
			}]}>
				<View style={styles.topImageBox}>
					<Image source={{uri: 'intro_1.png'}} style={styles.wideImage} />
				</View>

				<TouchableWithoutFeedback onPress={this.requestGuardianInfoView}>
					<View style={styles.guardianInfoButton}>
					</View>
				</TouchableWithoutFeedback>

				<View style={styles.logoBox}>
					<Image source={{uri: 'intro_2.png'}} style={styles.wideImage} />
				</View>

				<View>
					<LangPicker lang={this.state.lang} onLanguageChange={this.onLanguageChange} />
				</View>

				<View style={styles.bottomImageBox}>
					<Image source={{uri: 'intro_3.png'}} style={styles.wideImage} />
				</View>

				<TouchableHighlight onPress={this.onActionButtonPress} underlayColor={uiConfig.COLORS.BLUE_DIM}>
					<View style={styles.actionButton}>
						<Text style={styles.actionButtonText}>Go</Text>
					</View>
				</TouchableHighlight>

			</Animated.View>
		);
	},

	componentDidMount: function () {
		this.animateIn();
	},

	animateIn: function (cb) {
		Animated.parallel([
			Animated.timing(
				this.state.opacityValue,
				{ toValue: 1 }
			),
			Animated.timing(
				this.state.marginTopValue,
				{ toValue: 0 }
			)
		]).start(cb);
	},

	animateOut: function (cb) {
		Animated.parallel([
			Animated.timing(
				this.state.opacityValue,
				{ toValue: 0 }
			),
			//Animated.timing(
			//	this.state.marginTopValue,
			//	{ toValue: height }
			//)
		]).start(cb);
	},

	requestGuardianInfoView: function () {
		actions.emit(actions.GUARDIAN_INFO_REQUESTED);
	},

	onActionButtonPress: function () {
		actions.emit(actions.CHANGE_LANG, this.state.lang);
		this.animateOut(this.props.onSubmit);
	},

	onLanguageChange: function (lang) {
		this.setState({
			lang: lang
		});
	}

});

var styles = StyleSheet.create({

	wrap: {
		width: width,
		height: height,
		position: 'absolute',
		top: 0,
		backgroundColor: uiConfig.COLORS.INTRO_BG,
		flex: 1
	},

	guardianInfoButton: {
		position: 'absolute',
		top: 15,
		right: 10,
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'transparent'
	},

	wideImage: {
		flex: 1,
		resizeMode: Image.resizeMode.contain
	},

	topImageBox: {
		justifyContent: 'flex-start',
		overflow: 'visible',
		height: 70,
		backgroundColor: uiConfig.COLORS.MID_GREY
	},

	logoBox: {
		flex: 1
	},

	spacer: {
		flex: 1
	},

	bottomImageBox: {
		flex: 2
	},

	actionButton: {
		height: uiConfig.TOOLBAR_HEIGHT,
		backgroundColor: uiConfig.COLORS.BLUE
	},

	actionButtonText: {
		textAlign: 'center',
		alignSelf: 'stretch',
		fontFamily: uiConfig.SPECIAL_FONT,
		fontSize: uiConfig.WORD_BUTTON_QUESTION_TEXT_SIZE,
		color: 'white',
		paddingTop: 7
	},

	inner: {
		backgroundColor: 'green',
		height: 10
	}

});

module.exports = MainBar;
