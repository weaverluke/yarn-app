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

var NavBarButton = require('../statusbar/navbarbutton');
var ToolbarRandomButton = require('../randommenu/toolbarrandombutton');

var MainBar = React.createClass({

	getInitialState: function () {
		return {
			opacityValue: new Animated.Value(0),
			marginTopValue: new Animated.Value(uiConfig.TOOLBAR_ANIMATION_OFFSET)
		};
	},

	getDefaultProps: function () {
		return {
			activeIcon: 'browse',
			onRandomPressed: function () {}
		}
	},

	render: function () {
		var icons = {
			browse: this.isIconActive('browse') ? 'browse-icon-active.png' : 'browse-icon.png',
			settings: this.isIconActive('settings') ? 'settings-icon-active.png' : 'settings-icon.png'
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
							source={{uri: icons.browse}}
							style={styles.iconCentral}/>
					</TouchableWithoutFeedback>
				</View>
				<View style={styles.buttonWrap}>
					<TouchableWithoutFeedback onPress={this.onSettingsPressed}>
						<Image
							source={{uri: icons.settings}}
							style={styles.icon}/>
					</TouchableWithoutFeedback>
				</View>
				<View style={styles.spacer} />
				<View style={styles.randomButton}>
					<ToolbarRandomButton onPress={this.props.onRandomPressed} />
				</View>
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
		flex: 2
	},

	randomButton: {
		position: 'absolute',
		width: uiConfig.TOOLBAR_BUTTON_WIDTH,
		left: 0,
		flex: 1,

		shadowColor: '#000000',
		shadowOffset: {
			width: 2,
			height: 0
		},
		shadowOpacity: 0.5,
		shadowRadius: 1
	}
});

module.exports = MainBar;