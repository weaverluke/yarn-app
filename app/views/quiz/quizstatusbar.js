'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	Animated,
	TouchableWithoutFeedback,
	PropTypes
} = React;

var uiConfig = require('../../uiconfig');

var QuizStatusBar = React.createClass({

	propsTypes: {
		currentIndex: PropTypes.number.isRequired,
		total: PropTypes.number.isRequired,
		onCancelClick: PropTypes.func.isRequired
	},

	getDefaultProps: function () {
		return {
			currentIndex: 0,
			total: 0
		};
	},

	getInitialState: function () {
		return {
			opacityValue: new Animated.Value(0),
			marginTopValue: new Animated.Value(-uiConfig.TOOLBAR_ANIMATION_OFFSET)
		};
	},

	render: function () {
		var cancelText = '< Cancel';
		return (
			<Animated.View style={[styles.wrap, {
				transform: [
					{ translateY: this.state.marginTopValue }
				],
				opacity: this.state.opacityValue
			}]}>
				<View style={styles.leftContent}>
					<TouchableWithoutFeedback onPress={this.props.onCancelClick}>
						<Text style={styles.clickableText}>{cancelText}</Text>
					</TouchableWithoutFeedback>
				</View>
				<View style={styles.centerContent}>
					<Text style={styles.centerText}>Word {this.props.currentIndex} of {this.props.total}</Text>
				</View>
				<View style={styles.rightContent}>
				</View>

			</Animated.View>
		);
	},

	componentDidMount: function () {
		this.animateIn();
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
				{ toValue: -uiConfig.TOOLBAR_ANIMATION_OFFSET }
			)
		]).start();
	}
});


var styles = StyleSheet.create({

	wrap: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: uiConfig.TOOLBAR_HEIGHT,
		borderBottomWidth: 1,
		borderBottomColor: uiConfig.COLORS.MID_GREY,
		backgroundColor: uiConfig.COLORS.LIGHT_GREY,
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 1
		},
		shadowOpacity: 0.3,
		shadowRadius: 1,
		flexDirection: 'row',
		alignItems: 'stretch'
	},

	leftContent: {
		paddingLeft: 10,
		paddingRight: 10,
		flex: 1,
		justifyContent: 'center'
	},

	clickableText: {
		color: uiConfig.COLORS.BLUE,
		fontSize: 18
	},

	rightContent: {
		paddingLeft: 10,
		paddingRight: 10,
		flex: 1,
		justifyContent: 'center'
	},

	centerContent: {
		justifyContent: 'center'
	},

	centerText: {
		fontSize: 18,
		fontWeight: '500'
	}

});


module.exports = QuizStatusBar;
