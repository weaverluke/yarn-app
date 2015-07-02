'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
} = React;

var WordButton = require('./wordbutton');

var TOOLBAR_HEIGHT = 18;

var WordStrip = React.createClass({
	getInitialState: function () {
		return {
			height: TOOLBAR_HEIGHT
		};
	},

	render: function () {
		console.log('WordStrip:', this.props.onAction);
		var words = (this.props.words || []).map(function (word, i) {
			return (
				<WordButton 
					height={this.state.height} 
					arrow={i == 0}
					onAction={this.props.onAction}
					text={word}
				/>
			);
		}.bind(this));

		return (
			<View style={styles.toolbar}>
				{words}
			</View>
		);
	}
});

var styles = StyleSheet.create({

	toolbar: {
		backgroundColor: '#777777',
		flexDirection: 'row'
	}

});

module.exports = WordStrip;
