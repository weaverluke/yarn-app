'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	Image
} = React;

var config = require('../../config');

var IconButton = React.createClass({

	getDefaultProps: function () {
		return {
			icon: '',
			backgroundColor: 'white'
		};
	},

	getInitialState: function () {
		return {
			height: config.TOOLBAR_HEIGHT
		};
	},

	render: function () {
		var img = this.renderIcon();
		var additionalStyle = {
			backgroundColor: this.props.disabled ? config.COLORS.MID_GREY : this.props.backgroundColor
		};
		return (
			<TouchableWithoutFeedback onPress={this.props.disabled ? function () {} : this.props.onPress}>
				<View style={[styles.wrap, additionalStyle]}>
					{img}
				</View>
			</TouchableWithoutFeedback>
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
			default:
				return (<View />);
		}
	}
});

var styles = StyleSheet.create({
	wrap: {
		backgroundColor: '#FFFFFF',
		width: config.TOOLBAR_BUTTON_WIDTH,
		borderLeftWidth: 1,
		borderLeftColor: config.COLORS.MID_GREY,
		alignSelf: 'stretch',
		// these two do not work, I don't know why, so I'm using marginTop for icon positioning
		alignItems: 'center',
		justifyContent: 'center'
	},

	icon: {
		width: config.TOOLBAR_ICON_SIZE,
		height: config.TOOLBAR_ICON_SIZE,
		marginTop: Math.floor((config.TOOLBAR_HEIGHT - config.TOOLBAR_ICON_SIZE) / 2)
	},

	bigIcon: {
		width: config.TOOLBAR_BIG_ICON_SIZE,
		height: config.TOOLBAR_BIG_ICON_SIZE,
		marginTop: Math.floor((config.TOOLBAR_HEIGHT - config.TOOLBAR_BIG_ICON_SIZE) / 7)
	}
});


module.exports = IconButton;
