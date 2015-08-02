'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text
} = React;

var uiConfig = require('../../uiconfig');

var StatusBar = React.createClass({

	getDefaultProps: function () {
		return {
			totalWords: 0,
			currentWordIndex: 0
		};
	},

	getInitialState: function () {
		return {
			height: uiConfig.TOOLBAR_HEIGHT
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
		height: uiConfig.TOOLBAR_HEIGHT - uiConfig.PROGRESSBAR_HEIGHT + 1 // 1 for border
	},

	textWrap: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},

	text: {
		flex: 1,
		textAlign: 'right',
		color: uiConfig.COLORS.TEXT,
		fontSize: uiConfig.STATUSBAR_FONT_SIZE,
		fontWeight: '700'
	},

	textTotal: {
		flex: 1,
		textAlign: 'left',
		color: uiConfig.COLORS.TEXT,
		fontSize: uiConfig.STATUSBAR_FONT_SIZE
	},

	progressBarWrap: {
		flexDirection: 'row',
		height: 2
	},

	progressBar: {
		backgroundColor: uiConfig.COLORS.GREEN,
		height: uiConfig.PROGRESSBAR_HEIGHT
	},

	progressBarEnd: {
		height: uiConfig.PROGRESSBAR_HEIGHT
	}

});


module.exports = StatusBar;