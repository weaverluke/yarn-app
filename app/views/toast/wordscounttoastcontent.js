'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
} = React;

var uiConfig = require('../../uiconfig');

var ToastContent = React.createClass({

	getDefaultProps: function () {
		return {
			newCount: 0,
			oldCount: 0
		};
	},

	render: function () {
		return (
			<View style={styles.wrap}>
				<View style={styles.leftCell}>
					<View style={styles.vCenter}>
						<Text style={styles.leftNumber}>{this.props.oldCount}</Text>
						<Text style={styles.mainText}>re-test</Text>
					</View>
				</View>
				<View style={styles.rightCell}>
					<View style={styles.vCenter}>
						<Text style={styles.rightNumber}>{this.props.newCount}</Text>
						<Text style={styles.mainText}>new</Text>
					</View>
				</View>
				<View style={styles.label}>
					<View style={styles.labelBg}>
						<Text style={styles.labelText}>WORDS FOR YOU</Text>
					</View>
				</View>
			</View>
		);
	}
});

var styles = StyleSheet.create({
	wrap: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'stretch',
		justifyContent: 'space-around'
	},

	label: {
		position: 'absolute',
		top: 5,
		left: 0,
		right: 0,
		height: 10,
		flex: 0,
		alignItems: 'center'
	},

	labelBg: {
		backgroundColor: uiConfig.COLORS.LIGHT_GREY,
		borderRadius: 8,
		paddingLeft: 10,
		paddingRight: 10
	},

	labelText: {
		color: uiConfig.COLORS.TEXT,
		fontSize: 12
	},

	leftCell: {
		borderRightWidth: 1,
		borderRightColor: uiConfig.COLORS.MID_GREY,
		alignItems: 'center',
		flex: 1,
		paddingTop: 30,
		paddingLeft: 5
	},

	rightCell: {
		alignItems: 'center',
		flex: 1,
		paddingTop: 30,
		paddingRight: 5
	},

	vCenter: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center'
	},

	mainText: {
		fontSize: 26,
		fontFamily: uiConfig.SPECIAL_FONT,
		color: uiConfig.COLORS.MID_GREY,
		marginLeft: 5
	},

	leftNumber: {
		fontSize: 36,
		fontFamily: uiConfig.SPECIAL_FONT,
		color: uiConfig.COLORS.ORANGE
	},

	rightNumber: {
		fontSize: 36,
		fontFamily: uiConfig.SPECIAL_FONT,
		color: uiConfig.COLORS.RED
	}

});


module.exports = ToastContent;