'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback
} = React;

var COLORS = require('../../uiconfig').COLORS;

var Result = React.createClass({

	getDefaultProps: function () {
		return {
			onClose: function () {},
			correct: 0,
			wrong: 0
		};
	},

	getInitialState: function () {
		return {};
	},

	render: function () {
		return (
			<TouchableWithoutFeedback onPress={this.props.onClose}>
				<View style={styles.overlay}>
					<View style={styles.result}>
						<Text>Result:</Text>
						<Text>Correct: {this.props.correct}</Text>
						<Text>Wrong: {this.props.wrong}</Text>
						<Text>Tap to close this view</Text>
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	}
});

var styles = StyleSheet.create({

	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		backgroundColor: 'rgba(0,0,0,0.75)',
		flex: 1
	},

	result: {
		backgroundColor: '#FFFFFF',
		margin: 10,
		padding: 10,
		borderRadius: 3
	}

});


module.exports = Result;
