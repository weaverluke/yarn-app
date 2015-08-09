'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback
} = React;

var uiConfig = require('../../uiconfig');

var NavBarLabel = React.createClass({

	getDefaultProps: function () {
		return {
			color: uiConfig.COLORS.MID_GREY,
			backgroundColor: '#FFFFFF',
			text: '',
			onPress: function () {}
		};
	},

	getInitialState: function () {
		return {
			height: uiConfig.TOOLBAR_HEIGHT
		};
	},

	render: function () {
		var extraTextStyle = {
			color: this.props.color
		};
		if (this.props.specialFont) {
			extraTextStyle.fontFamily = 'Bauhaus 93';
			extraTextStyle.fontSize = 24;
			extraTextStyle.marginTop = 8;
		}

		return (
			<TouchableWithoutFeedback onPress={this.props.onPress}>
				<View style={[styles.wrap, {backgroundColor: this.props.backgroundColor}]}>
					<View style={styles.textWrap}>
						<Text style={[styles.text, extraTextStyle]}>{this.props.text}</Text>
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	}
});

var styles = StyleSheet.create({
	wrap: {
		borderLeftWidth: 1,
		borderLeftColor: uiConfig.COLORS.MID_GREY,
		alignItems: 'center',
		paddingLeft: 10,
		paddingRight: 10
	},
	textWrap: {
		flex: 1,
		alignItems: 'center',
		flexDirection: 'row'
	},
	text: {
	}
});


module.exports = NavBarLabel;