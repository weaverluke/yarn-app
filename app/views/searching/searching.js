'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Animated
} = React;

var BAR_WIDTH = 18;
var ANIMATION_TIME = 600;

var colors = [
	'rgba(39, 170, 225, 0.3)',
	'rgba(247, 148, 30, 0.3)',
	'rgba(65, 172, 96, 0.3)',
	'rgba(223, 28, 36, 0.3)',
	'rgba(247, 187, 40, 0.3)',
	'rgba(39, 170, 225, 0.3)',
	'rgba(247, 148, 30, 0.3)'
];

var uiConfig = require('../../uiconfig');

var Toast = React.createClass({

	getInitialState: function () {
		return {
			leftValue: new Animated.Value(-BAR_WIDTH),
			colorIndex: 0
		};
	},

	render: function () {
		var animationStyle = {
			transform: [
				{ translateX: this.state.leftValue }
			],
			backgroundColor: colors[this.state.colorIndex]
		};

		return (
			<View ref='wrap' style={styles.wrap}>
				<Animated.View style={[styles.scan, animationStyle]}></Animated.View>
			</View>
		);
	},

	componentDidMount: function () {
		setTimeout(this.animateToRight, 500);
	},

	animateToRight: function () {
		if (!this.isMounted()) {
			return;
		}

		this.nextColor();

		// it looks like some kind of bug as this is called only if component is mounted
		// so that ref should be already available but sometimes app throws error when accessing it
		if (!this.refs.wrap) {
			return setTimeout(this.animateToRight, 500);
		}

		this.refs.wrap.measure(function (ox, oy, width, height, px, py) {
			Animated.timing(
				this.state.leftValue,
				{ toValue: width, duration: ANIMATION_TIME }
			).start(this.animateToLeft);
		}.bind(this));
	},

	animateToLeft: function () {
		if (!this.isMounted()) {
			return;
		}

		this.nextColor();

		Animated.timing(
			this.state.leftValue,
			{ toValue: -BAR_WIDTH, duration: ANIMATION_TIME }
		).start(this.animateToRight);
	},

	nextColor: function () {
		this.setState({
			colorIndex: this.state.colorIndex === colors.length - 1 ? 0 : this.state.colorIndex + 1
		});
	}

});

var styles = StyleSheet.create({
	wrap: {
		position: 'absolute',
		top: uiConfig.BROWSER_BAR_HEIGHT,
		left: 0,
		right: 0,
		bottom: uiConfig.TOOLBAR_HEIGHT,
		alignItems: 'center',
		flex: 1,
		backgroundColor: 'transparent'
	},

	scan: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: BAR_WIDTH
	}
});


module.exports = Toast;
