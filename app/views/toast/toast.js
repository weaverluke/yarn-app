'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	Image,
	Animated
} = React;

var ANIMATION_TIME = 400;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');
var uiConfig = require('../../uiconfig');

var Toast = React.createClass({

	hideTimeout: 0,

	getDefaultProps: function () {
		return {
			content: '',
			width: uiConfig.TOAST_WIDTH,
			height: uiConfig.TOAST_HEIGHT,
			onClose: function () {}
		};
	},

	getInitialState: function () {
		return {
			opacityValue: new Animated.Value(0),
			marginTopValue: new Animated.Value(30)
		};
	},

	render: function () {
		var sizeStyle = {
			width: this.props.width,
			height: this.props.height,
			borderRadius: this.props.height / 2
		};
		var animationStyle = {
			transform: [
				{ translateY: this.state.marginTopValue }
			],
			opacity: this.state.opacityValue
		};

		return (
			<TouchableWithoutFeedback onPress={this.hide}>
				<View style={styles.wrap}>
					<View style={styles.center}>
						<Animated.View style={[styles.shadowWrap, sizeStyle, animationStyle]}>
							<View style={[styles.toast, sizeStyle]}>
								{this.props.content}
							</View>
						</Animated.View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	},

	componentDidMount: function () {
		this.animateIn();
	},

	animateIn: function () {
		Animated.parallel([
			Animated.timing(
				this.state.opacityValue,
				{ toValue: 1, duration: ANIMATION_TIME }
			),
			Animated.timing(
				this.state.marginTopValue,
				{ toValue: 0, duration: ANIMATION_TIME }
			)
		]).start();

		if (this.props.timeout) {
			this.hideTimeout = setTimeout(this.hide, this.props.timeout);
		}
	},

	animateOut: function () {
		Animated.parallel([
			Animated.timing(
				this.state.opacityValue,
				{ toValue: 0, duration: ANIMATION_TIME }
			)
		]).start(this.props.onClose);
	},

	hide: function () {
		clearTimeout(this.hideTimeout);
		this.animateOut();
	}

});

var styles = StyleSheet.create({
	wrap: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		alignItems: 'center',
		flex: 1,
		backgroundColor: 'transparent'

	},

	center: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
		backgroundColor: 'transparent'
	},

	toast: {
		backgroundColor: '#FFF',
		borderColor: uiConfig.COLORS.MID_GREY,
		borderRadius: 100,
		borderWidth: 1,
		overflow: 'hidden'
	},

	shadowWrap: {
		borderColor: uiConfig.COLORS.MID_GREY,
		borderRadius: 100,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.7,
		shadowRadius: 3
	}
});


module.exports = Toast;