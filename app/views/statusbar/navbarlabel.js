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
			texts: [],
			isFirst: false,
			onPress: function () {}
		};
	},

	getInitialState: function () {
		return {
			height: uiConfig.TOOLBAR_HEIGHT
		};
	},

	render: function () {
		var texts = [];
		for (var i = 0; i < this.props.texts.length; i++) {
			texts.push(this.renderTextItem(this.props.texts[i], i, this.props.specialFont));
		}

		return (
			<TouchableWithoutFeedback onPress={this.props.onPress}>
				<View style={[styles.wrap, {
					backgroundColor: this.props.backgroundColor,
					borderLeftWidth: this.props.isFirst ? 0 : 1
				}]}>
					<View style={styles.textWrap}>
						{texts}
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	},

	renderTextItem: function (cfg, key, useSpecialFont) {
		var extraStyle = {};
		if (useSpecialFont) {
			extraStyle.fontFamily = 'Bauhaus 93';
			extraStyle.fontSize = 24;
			extraStyle.lineHeight = 25;
			extraStyle.height = 24;
		}
		if (cfg.color) {
			extraStyle.color = cfg.color;
		}

		return (
			<Text key={'text-' + key} style={[styles.text, extraStyle]}>{cfg.text}</Text>
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