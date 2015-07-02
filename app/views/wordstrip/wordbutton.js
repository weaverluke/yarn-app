'use strict';

var React = require('react-native');
var {
	TouchableWithoutFeedback,
	StyleSheet,
	Text,
	View,
} = React;

var WordButton = React.createClass({
	render: function () {
		var height = this.props.height;
		var additionalStyle = {
			height: height
		};
		var arrow;

		if (this.props.arrow) {
			arrow = (
				<View style={[styles.buttonArrow, {
					borderTopWidth: height/2,
					borderBottomWidth: height/2
				}]}></View>
			);
		}
		else {
			additionalStyle.backgroundColor = '#777777';
			additionalStyle.borderRightWidth = 1;
			additionalStyle.borderRightColor = '#FFFFFF';
			additionalStyle.color = '#FFFFFF';
		}

		if (!this.props.text) {
			additionalStyle.backgroundColor = 'transparent';
			additionalStyle.width = 60;
		}

		if (this.props.green) {
			additionalStyle.backgroundColor = '#41AC60';
		}

		return (
			<TouchableWithoutFeedback onPress={this.onButtonPressed}>
				<View ref="button" style={[styles.wordButton, additionalStyle]}>
					<Text style={[styles.wordButtonText, {lineHeight: height * 0.7}, additionalStyle]}>
						{this.props.text}
					</Text>
					{arrow}
				</View>
			</TouchableWithoutFeedback>
		);
	},

	onButtonPressed: function () {
		console.log('onAction', this.props.onAction);
		this.refs.button.measure(function (ox, oy, width, height, px, py) {
			this.props.onAction({
				x: px,
				y: py,
				width: width,
				height: height
			}, this.props.text);
		}.bind(this));
	}
});

var styles = StyleSheet.create({

	wordButton: {
		flexDirection: 'row',
		backgroundColor: '#F2F1F2',
		color: '#333333'
	},

	wordButtonText: {
		paddingLeft: 5,
		paddingRight: 5,
		fontSize: 8,
		fontWeight: '500'
	},

	buttonArrow: {
		width: 5,
		borderTopColor: 'rgba(0,0,0,0)',
		borderBottomColor: 'rgba(0,0,0,0)',
		borderLeftWidth: 3,
		backgroundColor: '#777777',
		borderLeftColor: '#F2F1F2'
	}
});

module.exports = WordButton;
