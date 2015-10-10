'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Animated
} = React;

var BAR_WIDTH = 18;
var ANIMATION_TIME = 600;
var FADE_OUT_TIME = 500;

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
			opacityValue: new Animated.Value(0),
			colorIndex: 0,
			hidden: true
		};
	},

	getDefaultProps: function () {
		return {
			active: false
		};
	},

	render: function () {
		// if it's hidden then render empty view
		if (this.state.hidden) {
			return (<View />);
		}

		var barAnimationStyle = {
			transform: [
				{ translateX: this.state.leftValue }
			],
			backgroundColor: colors[this.state.colorIndex]
		};

		var wrapAnimationStyle = {
			opacity: this.state.opacityValue
		};

		return (
			<Animated.View ref='wrap' pointerEvents='none' style={[styles.wrap, wrapAnimationStyle]}>
				<View ref='barBox' style={styles.barBox}>
					<Animated.View pointerEvents='none' style={[styles.scan, barAnimationStyle]}></Animated.View>
				</View>
			</Animated.View>
		);
	},

	componentWillReceiveProps: function (props) {
		props.active ? this.show() : this.hide();
	},

	animateToRight: function () {
		if (!this.isMounted() || this.state.hidden) {
			return;
		}

		this.nextColor();

		// it looks like some kind of bug as this is called only if component is mounted
		// so that ref should be already available but sometimes app throws error when accessing it
		if (!this.refs.barBox || !this.refs.barBox.measure) {
			return setTimeout(this.animateToRight, 500);
		}


		this.refs.barBox.measure(function (ox, oy, width, height, px, py) {
			Animated.timing(
				this.state.leftValue,
				{ toValue: width, duration: ANIMATION_TIME }
			).start(this.animateToLeft);
		}.bind(this));
	},

	animateToLeft: function () {
		if (!this.isMounted() || this.state.hidden) {
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
	},

	animateOut: function (cb) {
		Animated.parallel([
			Animated.timing(
				this.state.opacityValue,
				{ toValue: 0, duration: FADE_OUT_TIME }
			)
		]).start(cb);
	},

	animateIn: function (cb) {
		Animated.parallel([
			Animated.timing(
				this.state.opacityValue,
				{ toValue: 1, duration: FADE_OUT_TIME/10 }
			)
		]).start(cb);
	},

	hide: function () {
		// do not set the same state again
		if (this.state.hidden) {
			return;
		}

		this.animateOut(function () {
			this.setState({hidden: true});
		}.bind(this));
	},

	show: function () {
		// do not set the same state again
		if (!this.state.hidden) {
			return;
		}

		this.setState({hidden: false});
		setTimeout(function () {
			this.animateIn();
			this.animateToRight();
		}.bind(this), 10);
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

	barBox: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
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
