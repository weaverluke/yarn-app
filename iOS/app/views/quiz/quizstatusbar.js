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

var config = require('../../config');

var QuizStatusBar = React.createClass({

	propsTypes: {
		currentIndex: PropTypes.number.isRequired,
		total: PropTypes.number.isRequired,
		onCancelClick: PropTypes.func.isRequired
	},

	getDefaultProps: function () {
		return {
			currentIndex: 0,
			total: 0,
			showCancelButton: true,
			text: ''
		};
	},

	getInitialState: function () {
		return {
			opacityValue: new Animated.Value(0),
			marginTopValue: new Animated.Value(-config.TOOLBAR_ANIMATION_OFFSET)
		};
	},

	render: function () {
		var cancelText = 'Cancel';
		var cancelButton;

		if (this.props.showCancelButton) {
			cancelButton = (
				<TouchableWithoutFeedback onPress={this.props.onCancelClick}>
					<View style={styles.leftContent}>
						<Text style={styles.backIcon}>&#x25C5;</Text>
						<Text style={styles.clickableText}>{cancelText}</Text>
					</View>
				</TouchableWithoutFeedback>
			);
		} else {
			cancelButton = <View style={styles.leftContent} />;
		}

		return (
			<Animated.View style={[styles.wrap, {
				transform: [
					{ translateY: this.state.marginTopValue }
				],
				opacity: this.state.opacityValue
			}]}>
				{cancelButton}
				<View style={styles.centerContent}>
					<Text style={styles.centerText}>{this.props.text}</Text>
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
				{ toValue: -config.TOOLBAR_ANIMATION_OFFSET }
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
		height: config.TOOLBAR_HEIGHT,
		borderBottomWidth: 1,
		borderBottomColor: config.COLORS.MID_GREY,
		backgroundColor: config.COLORS.LIGHT_GREY,
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
		paddingLeft: 5,
		paddingRight: 10,
		flex: 1,
		justifyContent: 'flex-start',
		flexDirection: 'row',
		alignItems: 'center'
	},

	clickableText: {
		color: config.COLORS.BLUE,
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
	},

	backIcon: {
		fontSize: 20,
		marginTop: 6,
		marginRight: 2,
		fontFamily: 'SS Standard',
		color: config.COLORS.BLUE
	}

});


module.exports = QuizStatusBar;
