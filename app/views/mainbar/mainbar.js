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

	getDefaultProps: function () {
		return {
			activeIcon: 'browse'
		}
	},

	render: function () {
		// images from xcassets must be passed with whole name to require(), so we can't precompute image name and
		// pass it later to require()
		var icons = {
			browse: this.isIconActive('browse') ? require('image!browse-icon-active') : require('image!browse-icon'),
			settings: this.isIconActive('settings') ? require('image!settings-icon-active') : require('image!settings-icon')
		};

		return (
			<Animated.View style={[styles.wrap, {
				transform: [
					{ translateY: this.state.marginTopValue }
				],
				opacity: this.state.opacityValue
			}]}>
				<View style={styles.spacer} />
				<View style={styles.buttonWrap}>
					<TouchableWithoutFeedback onPress={this.onBrowsePressed}>
						<Image
							source={icons.browse}
							style={styles.iconCentral}/>
					</TouchableWithoutFeedback>
				</View>
				<View style={styles.buttonWrap}>
					<TouchableWithoutFeedback onPress={this.onSettingsPressed}>
						<Image
							source={icons.settings}
							style={styles.icon}/>
					</TouchableWithoutFeedback>
				</View>
				<View style={styles.spacer} />
			</Animated.View>
		);
	},

	isIconActive: function (icon) {
		return this.props.activeIcon === icon;
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

	onBrowsePressed: function () {
		actions.emit(actions.BROWSE_BUTTON_PRESSED);
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