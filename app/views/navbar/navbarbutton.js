'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	Image
} = React;

var uiConfig = require('../../uiconfig');

var ICON_SIZE = 12;

var NavBarButton = React.createClass({

	getDefaultProps: function () {
		return {
			icon: ''
		};
	},

	getInitialState: function () {
		return {
			height: uiConfig.TOOLBAR_HEIGHT
		};
	},

	render: function () {
		var img = this.renderIcon();
		return (
			<TouchableWithoutFeedback onPress={this.props.onPress}>
				<View style={styles.wrap}>
					{img}
				</View>
			</TouchableWithoutFeedback>
		);
	},

	renderIcon: function () {
		// I have no idea why require('image!'+this.props.icon) doesn't work
		switch (this.props.icon) {
			case 'settings':
				return (
					<Image source={require('image!settings-icon')} style={styles.icon}/>
				);
			case 'next':
				return (
					<Image source={require('image!next-icon')} style={styles.icon}/>
				);
			default:
				return (<View />);
		}
	}
});

var styles = StyleSheet.create({
	wrap: {
		backgroundColor: '#FFFFFF',
		width: uiConfig.TOOLBAR_BUTTON_WIDTH,
		borderLeftWidth: 1,
		borderLeftColor: uiConfig.COLORS.MID_GREY,
		alignSelf: 'stretch',
		// these two do not work, I don't know why, so I'm using marginTop for icon positioning
		alignItems: 'center',
		justifyContent: 'center'
	},

	icon: {
		width: uiConfig.TOOLBAR_ICON_SIZE,
		height: uiConfig.TOOLBAR_ICON_SIZE,
		marginTop: Math.floor((uiConfig.TOOLBAR_HEIGHT - uiConfig.TOOLBAR_ICON_SIZE) / 2)
	}
});


module.exports = NavBarButton;