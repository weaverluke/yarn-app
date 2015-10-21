'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	Image,
	Animated
} = React;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');

var actions = require('../../actions/actions');
var uiConfig = require('../../uiconfig');

var MainBar = React.createClass({

	getInitialState: function () {
		return {
			opacityValue: new Animated.Value(0),
			marginTopValue: new Animated.Value(uiConfig.TOOLBAR_ANIMATION_OFFSET)
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
				<View style={styles.spacer} />
				<View style={styles.buttonWrap}>
					<TouchableWithoutFeedback onPress={this.onQuizPressed}>
						<Image source={require('image!yarn-icon')} style={styles.iconCentral}/>
					</TouchableWithoutFeedback>
				</View>
				<View style={styles.buttonWrap}>
					<TouchableWithoutFeedback onPress={this.onSettingsPressed}>
						<Image source={require('image!settings-icon')} style={styles.icon}/>
					</TouchableWithoutFeedback>
				</View>
				<View style={styles.spacer} />
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
			Animated.timing(
				this.state.marginTopValue,
				{ toValue: uiConfig.TOOLBAR_ANIMATION_OFFSET }
			)
		]).start(cb);
	},

	onQuizPressed: function () {
		actions.emit(actions.QUIZ_BUTTON_PRESSED);
	},
	onSettingsPressed: function () {
		actions.emit(actions.SETTINGS_BUTTON_PRESSED);
	}
});

var styles = StyleSheet.create({

	wrap: {
		flexDirection: 'row',
		height: uiConfig.TOOLBAR_HEIGHT,
		position: 'absolute',
		bottom: 0,
		width: width,
		borderTopWidth: 1,
		borderTopColor: uiConfig.COLORS.MID_GREY
	},

	buttonWrap: {
		flex: 2,
		alignItems: 'center',
		justifyContent: 'center'
	},

	icon: {
		width: uiConfig.TOOLBAR_ICON_SIZE,
		height: uiConfig.TOOLBAR_ICON_SIZE
	},

	iconCentral: {
		width: uiConfig.TOOLBAR_ICON_SIZE + 8,
		height: uiConfig.TOOLBAR_ICON_SIZE + 8
	},

	spacer: {
		flex: 1
	}
});

module.exports = MainBar;