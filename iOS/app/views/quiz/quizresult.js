var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	Dimensions,
	Animated
} = React;

var config = require('../../config');
var {width, height} = Dimensions.get('window');

var QuizResult = React.createClass({

	getDefaultProps: function () {
		return {
			correctWords: 0,
			totalWords: 1,
			onAnimationEnd: function () {}
		};
	},

	render: function() {
		var progress = this.props.correctWords / this.props.totalWords * 100;

		return (
			<View style={styles.progressBox}>
				<View style={styles.progressTextWrap}>
					<Text style={styles.text}>{this.props.correctWords} of {this.props.totalWords} correct</Text>
				</View>
				<ProgressBar progress={progress} onAnimationEnd={this.props.onAnimationEnd}/>
			</View>
		);
	}
});

var ProgressBar = React.createClass({

	getDefaultProps: function () {
		return {
			progress: 0,
			onAnimationEnd: function () {}
		};
	},

	getInitialState: function () {
		return {
			flexValue: new Animated.Value(-width * this.props.progress/100)
		};
	},

	componentDidMount: function () {
		setTimeout(this.animateProgressBar, 400);
	},

	render: function () {
		// the best would be to use scaleX(this.props.progress) but react-native doesn't support transform-origin yet
		var progressStyle = {
			flex: this.props.progress,
			transform: [
				{ translateX: this.state.flexValue }
			]
		};
		var endStyle = {
			flex: 100 - this.props.progress
		};

		return (
			<View style={styles.progressBarWrap}>
				<Animated.View style={[styles.progressBar, progressStyle]} />
				<View style={[styles.progressBarEnd, endStyle]} />
			</View>
		);
	},

	animateProgressBar: function () {
		Animated.parallel([
			Animated.timing(
				this.state.flexValue,
				{ toValue: 0, duration: 500 }
			)
		]).start(this.props.onAnimationEnd);
	}

});

var styles = StyleSheet.create({

	progressBox: {
		height: config.TOOLBAR_HEIGHT,
		backgroundColor: '#FFFFFF'
	},

	progressTextWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
		paddingLeft: 20
	},

	text: {
		color: config.COLORS.SELECTED_GREY,
		fontSize: config.PROGRESSBAR_FONT_SIZE,
		lineHeight: config.PROGRESSBAR_FONT_SIZE + 10,
		fontFamily: config.SPECIAL_FONT
	},

	progressBarWrap: {
		flexDirection: 'row',
		backgroundColor: 'white',
		height: config.PROGRESSBAR_HEIGHT
	},

	progressBar: {
		backgroundColor: config.COLORS.GREEN,
		height: config.PROGRESSBAR_HEIGHT
	},

	progressBarEnd: {
		backgroundColor: 'white',
		height: config.PROGRESSBAR_HEIGHT
	}

});


module.exports = QuizResult;
