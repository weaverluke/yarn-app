'use strict';

var React = require('react-native');
var {
  AppRegistry,
  TouchableWithoutFeedback,
  // StyleSheet,
  // Text,
  // View,

  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} = React;

var TOOLBAR_HEIGHT = 18;

var YarnToolbar = React.createClass({
	getInitialState: function () {
		return {
			height: TOOLBAR_HEIGHT
		};
	},

	render: function () {
		console.log('YarnToolbar:', this.props.onAction);
		var words = (this.props.words || []).map(function (word) {
			return (
				<WordButton 
					height={this.state.height} 
					arrow={true}
					onAction={this.props.onAction}
					text={word} />
			);
		}.bind(this));

		return (
			<View style={styles.toolbar}>
				{words}
			</View>
		);

		// return (
		// 	<View style={styles.toolbar}>
		// 		<WordButton 
		// 			height={this.state.height} 
		// 			arrow={true}
		// 			onAction={this.props.onAction}
		// 			text='corporation'>
		// 		</WordButton>
		// 		<WordButton onAction={this.props.onAction} />
		// 		<WordButton onAction={this.props.onAction} green={true} />
		// 		<WordButton onAction={this.props.onAction} />
		// 	</View>
		// );
	}
});


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
			additionalStyle.borderRightColor = '#F2F1F2';
			additionalStyle.borderRightWidth = 1;
		}

		if (!this.props.text) {
			additionalStyle.backgroundColor = 'transparent';
			additionalStyle.width = 60;	
		}

		if (this.props.green) {
			additionalStyle.backgroundColor = '#41AC60';
		}


		return (
			<TouchableWithoutFeedback onPress={this.showPopup}>
				<View ref="button" style={[styles.wordButton, additionalStyle]}>
						<Text style={[styles.wordButtonText, {lineHeight: height * 0.7}]}>
								{this.props.text}
						</Text>
						{arrow}
				</View>
			</TouchableWithoutFeedback>
		);
	},

	showPopup: function () {
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

	toolbar: {
		backgroundColor: '#777777',
		flexDirection: 'row'
	},

	wordButton: {
		flexDirection: 'row',
		backgroundColor: '#F2F1F2',
		color: '#333333',
	},

	wordButtonText: {
		backgroundColor: '#F2F1F2',
		color: '#333333',
		paddingLeft: 5,
		paddingRight: 5,
		fontSize: 8,
		fontWeight: '500',
	},

	buttonArrow: {
	    width: 5,
	    borderTopColor: 'rgba(0,0,0,0)',
	    borderBottomColor: 'rgba(0,0,0,0)',
	    borderLeftWidth: 3,
	    backgroundColor: '#777777',
		borderLeftColor: '#F2F1F2',
	}
});

module.exports = YarnToolbar;
