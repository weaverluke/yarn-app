'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	TouchableHighlight,
	Image,
	Animated,
	PickerIOS,
	PickerItemIOS
} = React;

var ANIMATION_TIME = 300;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');

var actions = require('../../actions/actions');
var uiConfig = require('../../uiconfig');
var LangPicker = require('../langpicker/langpicker');

var SettingsView = React.createClass({

	getInitialState: function () {
		return {
			opacityValue: new Animated.Value(0),
			marginTopValue: new Animated.Value(0),
			lang: this.props.lang,
			guardianInfoViewVisible: false,
			visible: this.props.visible
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
					<Image source={{uri: 'intro_1.png'}} style={[styles.wideImage]} />
				</View>

				<TouchableWithoutFeedback onPress={this.requestGuardianInfoView}>
					<View style={styles.guardianInfoButton}>
					</View>
				</TouchableWithoutFeedback>

				<LangPicker lang={this.state.lang} onLanguageChange={this.onLanguageChange} />

			</Animated.View>
		);
	},

	componentDidMount: function () {
		this.state.visible && this.animateIn();
	},

	componentWillReceiveProps: function (newProps) {
		if (this.props.visible === newProps.visible) {
			return;
		}
		newProps.visible ? this.animateIn() : this.animateOut();

		// we're changing from hidden to visible so we're updating currently set language
		if (!this.props.visible && newProps.visible) {
			this.animateIn();
			this.setState({lang: newProps.lang});
		}

		// change from visible to hidden
		else if (this.props.visible && !newProps.visible) {
			this.animateOut();
			// lang has changed
			if (this.props.lang !== this.state.lang) {
				actions.emit(actions.CHANGE_LANG, this.state.lang);
			}
		}
	},

	animateIn: function (cb) {
		Animated.parallel([
			Animated.timing(
				this.state.opacityValue,
				{ toValue: 1, duration: ANIMATION_TIME }
			),
			Animated.timing(
				this.state.marginTopValue,
				{ toValue: 0, duration: ANIMATION_TIME }
			)
		]).start(cb);
	},

	animateOut: function (cb) {
		Animated.parallel([
			Animated.timing(
				this.state.opacityValue,
				{ toValue: 0, duration: ANIMATION_TIME }
			)
			//Animated.timing(
			//	this.state.marginTopValue,
			//	{ toValue: height }
			//)
		]).start(cb);
	},


	onLanguageChange: function (lang) {
		this.setState({
			lang: lang
		});
	},

	requestGuardianInfoView: function () {
		actions.emit(actions.GUARDIAN_INFO_REQUESTED);
	},

	hide: function (cb) {
		this.animateOut(cb);
	}
});

var styles = StyleSheet.create({

	wrap: {
		width: width,
		height: height - uiConfig.TOOLBAR_HEIGHT - uiConfig.IOS_STATUSBAR_HEIGHT,
		position: 'absolute',
		top: 0
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
	}

});

module.exports = SettingsView;
