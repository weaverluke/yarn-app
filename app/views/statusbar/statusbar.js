'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	Animated
} = React;

var NavBarLabel = require('./navbarlabel');
var uiConfig = require('../../uiconfig');

var StatusBar = React.createClass({

	getDefaultProps: function () {
		return {
			totalWords: 0,
			correctWords: 0,
			score: 0,
			level: 0,
			nextText: 'Onwards >',
			showWordsCount: false,
			wordsCount: 0,
			startHidden: false,
			onNextPress: function () {}
		};
	},

	getInitialState: function () {
		return {
			height: uiConfig.TOOLBAR_HEIGHT,
			opacityValue: new Animated.Value(this.props.startHidden ? 0 : 1),
			marginTopValue: new Animated.Value(this.props.startHidden ? uiConfig.TOOLBAR_ANIMATION_OFFSET : 0)
		};
	},

	render: function () {
		var items = this.props.showWordsCount ? this.renderWordsCount() : this.renderStats();

		return (
			<Animated.View style={[styles.wrap, {
				transform: [
					{ translateY: this.state.marginTopValue }
				],
				opacity: this.state.opacityValue
			}]}>
				{items}
				<NavBarLabel
					onPress={this.props.onNextPress}
					texts={[{text: this.props.nextText, color: '#FFFFFF'}]}
					backgroundColor={uiConfig.COLORS.BLUE}
					style={styles.nextButton}
				/>
			</Animated.View>
		);
	},

	renderWordsCount: function () {
		var texts = [{
			text: this.props.wordsCount,
			color: uiConfig.COLORS.ORANGE
		},{
			text: ' ' + (this.props.wordsCount === 1 ? 'word' : 'words') + '...',
			color: uiConfig.COLORS.MID_GREY
		}];

		return (
			<View style={styles.contentWrap}>
				<View style={styles.wordsCountCenterH}>
					<View style={styles.wordsCountCenterV}>
						<NavBarLabel
							texts={texts}
							specialFont={true}
							isFirst={true}
						/>
					</View>
				</View>
			</View>
		);
	},

	renderStats: function () {
		var progress = (this.props.correctWords) / this.props.totalWords * 100;

		return (
			<View style={styles.contentWrap}>
				<View style={styles.progressBox}>
					<View style={styles.progressTextWrap}>
						<View style={styles.progressTextWrapVertical}>
							<Text style={styles.text}>{this.props.correctWords}</Text>
							<Text style={styles.textTotal}>/{this.props.totalWords} correct</Text>
						</View>
					</View>
					<ProgressBar progress={progress}/>
				</View>
				<NavBarLabel
					texts={[{text: this.props.score, color: uiConfig.COLORS.ORANGE}]}
					style={styles.score}
					specialFont={true}
				/>
				<NavBarLabel
					texts={[{text: this.props.level, color: uiConfig.COLORS.RED}]}
					color={uiConfig.COLORS.RED}
					style={styles.level}
					specialFont={true}
				/>
			</View>
		);
	},

	animateIn: function () {
		Animated.parallel([
			Animated.timing(
				this.state.opacityValue,
				{ toValue: 1 }
			),
			Animated.timing(
				this.state.marginTopValue,
				{ toValue: 0 }
			)
		]).start();
	},

	animateOut: function () {
		Animated.parallel([
			Animated.timing(
				this.state.opacityValue,
				{ toValue: 0 }
			),
			Animated.timing(
				this.state.marginTopValue,
				{ toValue: uiConfig.TOOLBAR_ANIMATION_OFFSET }
			)
		]).start();
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
		borderTopWidth: 1,
		borderTopColor: uiConfig.COLORS.MID_GREY,
		height: uiConfig.TOOLBAR_HEIGHT - uiConfig.PROGRESSBAR_HEIGHT + 1, // 1 for border
		flexDirection: 'row',
		alignItems: 'stretch'
	},

	contentWrap: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'stretch'
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
	},

	wordsCountCenterH: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		backgroundColor: '#FFFFFF'
	},

	wordsCountCenterV: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	}

});


module.exports = StatusBar;