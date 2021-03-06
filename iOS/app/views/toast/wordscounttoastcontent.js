'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
} = React;

var config = require('../../config');

var ToastContent = React.createClass({

	getDefaultProps: function () {
		return {
			count: 0
		};
	},

	render: function () {
		return (
			<View style={styles.wrap}>
				<View style={styles.cell}>
					<View style={styles.vCenter}>
						<Text style={styles.number}>{this.props.count}</Text>
						<Text style={styles.text}>words to study</Text>
					</View>
				</View>
			</View>
		);
	}
});

var styles = StyleSheet.create({
	wrap: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch'
	},

	vCenter: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},

	text: {
		fontSize: 26,
		fontFamily: config.SPECIAL_FONT,
		color: config.COLORS.MID_GREY,
		marginLeft: 10
	},

	number: {
		fontSize: 36,
		marginTop: 4,
		fontFamily: config.SPECIAL_FONT,
		color: config.COLORS.ORANGE
	}
});


module.exports = ToastContent;