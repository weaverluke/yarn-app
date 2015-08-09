'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
} = React;

var StatusBar = require('./statusbar');
var NavbarButton = require('./navbarbutton');

var uiConfig = require('../../uiconfig');

var NavBar = React.createClass({

	getDefaultProps: function () {
		return {
			totalWords: 0,
			currentWordIndex: 0,
			showNextButton: true,
			onNextPress: function () {},
			onSettingsPress: function () {}
		};
	},

	getInitialState: function () {
		return {
			height: uiConfig.TOOLBAR_HEIGHT
		};
	},

	render: function () {
		return (
			<View style={styles.navbar}>
				<StatusBar
					totalWords={this.props.totalWords}
					currentWordIndex={this.props.currentWordIndex}
				/>
			</View>
		);
	},

	renderNextButton: function () {
		if (this.props.showNextButton) {
			return (
				<NavbarButton
					icon={'next'}
					onPress={this.props.onNextPress}
					/>
			);
		}

		return (<View />);

	}
});

var styles = StyleSheet.create({

	navbar: {
		backgroundColor: '#FFFFFF',
		flexDirection: 'row',
		alignItems: 'stretch',
		borderTopWidth: 1,
		borderTopColor: uiConfig.COLORS.MID_GREY
	}

});


module.exports = NavBar;