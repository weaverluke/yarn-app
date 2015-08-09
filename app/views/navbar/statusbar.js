'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text
} = React;

var NavBarLabel = require('./navbarlabel');
var NavBarButton = require('./navbarbutton');
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
				<View style={styles.progressBox}>
					<View style={styles.progressTextWrap}>
						<View style={styles.progressTextWrapVertical}>
							<Text style={styles.text}>{this.props.currentWordIndex + 1}</Text>
							<Text style={styles.textTotal}>/{this.props.totalWords} correct</Text>
						</View>
					</View>
					<ProgressBar progress={progress}/>
				</View>
				<NavBarLabel
					text='11,320'
					color={uiConfig.COLORS.ORANGE}
					style={styles.score}
					specialFont={true}
				/>
				<NavBarLabel
					text='76'
					color={uiConfig.COLORS.RED}
					style={styles.level}
					specialFont={true}
				/>
				<NavBarLabel
					text='Onwards >'
					color='#FFFFFF'
					backgroundColor={uiConfig.COLORS.BLUE}
					style={styles.nextButton}
				/>
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
		height: uiConfig.TOOLBAR_HEIGHT - uiConfig.PROGRESSBAR_HEIGHT + 1, // 1 for border
		flexDirection: 'row'
	},

	progressTextWrap: {
		flex: 1,
		alignItems: 'center'
	},

	progressTextWrapVertical: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},

	text: {
		textAlign: 'right',
		color: uiConfig.COLORS.TEXT,
		fontSize: uiConfig.PROGRESSBAR_FONT_SIZE,
		fontWeight: '700'
	},

	textTotal: {
		textAlign: 'left',
		color: uiConfig.COLORS.TEXT,
		fontSize: uiConfig.PROGRESSBAR_FONT_SIZE
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
		backgroundColor: uiConfig.COLORS.MID_GREY,
		height: uiConfig.PROGRESSBAR_HEIGHT
	},

	progressBox: {
		flex: 2
	},

	score: {
		flex: 2
	},

	level: {
		flex: 1
	},

	nextButton: {
		flex: 2
	}

});


module.exports = StatusBar;