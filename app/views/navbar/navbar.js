'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
} = React;

var StatusBar = require('./statusbar');
var NavbarButton = require('./navbarbutton');

var COLORS = require('../../constants').COLORS;

var TOOLBAR_HEIGHT = 18;

var NavBar = React.createClass({

	getDefaultProps: function () {
		return {
			totalWords: 0,
			currentWordIndex: 0,
			onNextPress: function () {},
			onSettingsPress: function () {}
		};
	},

	getInitialState: function () {
		return {
			height: TOOLBAR_HEIGHT
		};
	},

	render: function () {
		return (
			<View style={styles.navbar}>
				<StatusBar
					totalWords={this.props.totalWords}
					currentWordIndex={this.props.currentWordIndex}
				/>
				<NavbarButton
					icon={'next'}
					onPress={this.props.onNextPress}
				/>
				<NavbarButton
					icon={'settings'}
					onPress={this.props.onSettingsPress}
				/>
			</View>
		);
	}
});

var styles = StyleSheet.create({

	navbar: {
		backgroundColor: '#FFFFFF',
		flexDirection: 'row',
		alignItems: 'stretch',
		borderTopWidth: 1,
		borderTopColor: COLORS.MID_GREY
	}

});


module.exports = NavBar;