'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableHighlight,
	Image
} = React;

var uiConfig = require('../../uiconfig');

var NavBarButton = React.createClass({

	getDefaultProps: function () {
		return {
			icon: '',
			backgroundColor: 'white'
		};
	},

	getInitialState: function () {
		return {
			height: uiConfig.TOOLBAR_HEIGHT
		};
	},

	render: function () {
		var img = this.renderIcon();
		var additionalStyle = {
			backgroundColor: this.props.disabled ? uiConfig.COLORS.MID_GREY : this.props.backgroundColor
		};
		return (
			<TouchableHighlight onPress={this.props.disabled ? function () {} : this.props.onPress}>
				<View style={[styles.wrap, additionalStyle]}>
					{img}
				</View>
			</TouchableHighlight>
		);
	},

	renderIcon: function () {
		switch (this.props.icon) {
			case 'settings':
				return (
					<Image source={{uri: 'settings-icon.png'}} style={styles.icon}/>
				);
			case 'next':
				var imgUri = this.props.disabled ? 'next-disabled.gif' : 'next-finished.gif';
				return (
					<Image source={{uri: imgUri}} style={styles.bigIcon}/>
				);
			case 'random':
				return (
					<Image source={{uri: 'random-icon.png'}} style={styles.randomIcon}/>
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
		height: uiConfig.TOOLBAR_HEIGHT,
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
	},

	bigIcon: {
		width: uiConfig.TOOLBAR_BIG_ICON_SIZE,
		height: uiConfig.TOOLBAR_BIG_ICON_SIZE
	},

	randomIcon: {
		width: uiConfig.TOOLBAR_ICON_SIZE + 8,
		height: uiConfig.TOOLBAR_ICON_SIZE + 8
	}
});


module.exports = NavBarButton;