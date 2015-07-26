'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback
} = React;

var COLORS = require('../../constants').COLORS;

var Settings = React.createClass({

	getDefaultProps: function () {
		return {
			onClose: function () {}
		};
	},

	render: function () {
		return (
			<TouchableWithoutFeedback onPress={this.props.onClose}>
				<View style={styles.overlay}>
					<View style={styles.content}>
						<Text>This is going to be settings view</Text>
						<Text>Tap anywhere to close</Text>
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

	content: {
		backgroundColor: '#FFFFFF',
		margin: 10,
		padding: 10,
		borderRadius: 3
	}
});


module.exports = Settings;
