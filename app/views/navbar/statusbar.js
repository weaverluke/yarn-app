'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text
} = React;

var COLORS = require('../../constants').COLORS;

var TOOLBAR_HEIGHT = 18;
var PROGRESSBAR_HEIGHT = 2;

var StatusBar = React.createClass({

	getDefaultProps: function () {
		return {
			totalWords: 0,
			currentWordIndex: 0
		};
	},

	getInitialState: function () {
		return {
			height: TOOLBAR_HEIGHT
		};
	},

	render: function () {
		var progress = (this.props.currentWordIndex+1) / this.props.totalWords * 100;
		return (
			<View style={styles.wrap}>
				<View style={styles.textWrap}>
					<Text style={styles.text}>{this.props.currentWordIndex + 1}</Text>
					<Text style={styles.textTotal}>/{this.props.totalWords} words...</Text>
				</View>
				<ProgressBar progress={progress}/>
			</View>
		);
	}
});

var ProgressBar = React.createClass({
	getDefaultProps: function () {
		return {
			progress: 0
		};
	},

	render: function () {
		// the best would be to use scaleX(this.props.progress) but react-native doesn't support transform-origin yet
		var progressStyle = {
			flex: this.props.progress
		};
		var endStyle = {
			flex: 100 - this.props.progress
		};

		return (
			<View style={styles.progressBarWrap}>
				<View style={[styles.progressBar, progressStyle]} />
				<View style={[styles.progressBarEnd, endStyle]} />
			</View>
		);
	}

});

var styles = StyleSheet.create({

	wrap: {
		flex: 1, // so it expands to fit all the space up to the buttons
		height: TOOLBAR_HEIGHT - PROGRESSBAR_HEIGHT + 1 // 1 for border
	},

	textWrap: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},

	text: {
		flex: 1,
		textAlign: 'right',
		color: COLORS.TEXT,
		fontSize: 6,
		fontWeight: '700'
	},

	textTotal: {
		flex: 1,
		textAlign: 'left',
		color: COLORS.TEXT,
		fontSize: 6
	},

	progressBarWrap: {
		flexDirection: 'row',
		height: 2
	},

	progressBar: {
		backgroundColor: COLORS.GREEN,
		height: PROGRESSBAR_HEIGHT
	},

	progressBarEnd: {
		height: PROGRESSBAR_HEIGHT
	}

});


module.exports = StatusBar;