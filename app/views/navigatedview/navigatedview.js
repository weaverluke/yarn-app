'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	TouchableHighlight,
	Animated,
} = React;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');
var uiConfig = require('../../uiconfig');

var NavigatedView = React.createClass({

	marginAnimationOffset: 0,

	getInitialState: function () {
		var marginAnimationOffset = 0;

		if (this.props.animatePosition) {
			marginAnimationOffset = this.props.positionAnimationOffset || height;
		}

		this.marginAnimationOffset = marginAnimationOffset;

		return {
			opacityValue: new Animated.Value(this.props.animateOpacity ? 0 : 1),
			marginTopValue: new Animated.Value(marginAnimationOffset)
		};
	},

	getDefaultProps: function () {
		return {
			backText: '',
			titleText: '',
			nextText: '',
			actionText: '',
			content: '',

			onBackPressed: function () {},
			onNextPressed: function () {},
			onActionPressed: function () {},

			animatePosition: true,
			animateOpacity: true,
			animationDuration: 300,
			// if set to 0 then it will animate across whole screen
			positionAnimationOffset: 0
		}
	},

	render: function () {
		return (
			<Animated.View style={[styles.wrap, {
				transform: [
					{ translateY: this.state.marginTopValue }
				],
				opacity: this.state.opacityValue
			}]}>
				<View style={styles.topBar}>
					{this.renderNavBack()}
					{this.renderTitle()}
					{this.renderNavNext()}
				</View>

				<View style={styles.spacer}>
					{this.props.content}
				</View>

				{this.renderActionButton()}
			</Animated.View>
		);
	},

	componentDidMount: function () {
		this.animateIn();
	},

	renderNavBack: function () {
		if (!this.props.backText) {
			return <View style={styles.leftContent} />
		}

		return (
			<TouchableWithoutFeedback onPress={this.createHideHandler(this.props.onBackPressed)}>
				<View style={styles.leftContent}>
					<Text style={styles.backIcon}>&#x25C5;</Text>
					<Text style={styles.clickableText}>{this.props.backText}</Text>
				</View>
			</TouchableWithoutFeedback>
		)
	},

	renderNavNext: function () {
		if (!this.props.nextText) {
			return <View style={styles.rightContent} />
		}

		return (
			<TouchableWithoutFeedback onPress={this.createHideHandler(this.onNextPressed)}>
				<View style={styles.rightContent}>
					<Text style={styles.clickableText}>{this.props.nextText}</Text>
				</View>
			</TouchableWithoutFeedback>
		)
	},

	renderTitle: function () {
		return (
			<View style={styles.centerContent}>
				<Text style={styles.centerText}>{this.props.titleText}</Text>
			</View>
		);
	},

	renderActionButton: function () {
		if (this.props.actionText) {
			return (
				<TouchableHighlight onPress={this.createHideHandler(this.onActionButtonPress)} underlayColor={uiConfig.COLORS.BLUE_DIM}>
					<View style={styles.actionButton}>
						<Text style={styles.actionButtonText}>Go</Text>
					</View>
				</TouchableHighlight>
			);
		}
	},

	createHideHandler: function (callback) {
		return function () {
			this.animateOut(callback);
		}.bind(this);
	},

	animateIn: function (cb) {
		var animations = [];

		if (this.props.animateOpacity) {
			animations.push(Animated.timing(
				this.state.opacityValue,
				{ toValue: 1, duration: this.props.animationDuration }
			));
		}

		if (this.props.animatePosition) {
			animations.push(Animated.timing(
				this.state.marginTopValue,
				{ toValue: 0, duration: this.props.animationDuration }
			));
		}

		Animated.parallel(animations).start(cb);
	},

	animateOut: function (cb) {
		var animations = [];

		if (this.props.animateOpacity) {
			animations.push(Animated.timing(
				this.state.opacityValue,
				{toValue: 0, duration: this.props.animationDuration}
			));
		}

		if (this.props.animatePosition) {
			animations.push(Animated.timing(
				this.state.marginTopValue,
				{toValue: this.marginAnimationOffset, duration: this.props.animationDuration}
			));
		}

		Animated.parallel(animations).start(cb);
	}

});

var styles = StyleSheet.create({

	wrap: {
		width: width,
		height: height,
		position: 'absolute',
		top: 0,
		flex: 1,
		backgroundColor: 'white'
	},

	topBar: {
		borderBottomWidth: 1,
		borderBottomColor: uiConfig.COLORS.MID_GREY,
		backgroundColor: uiConfig.COLORS.LIGHT_GREY,
		flexDirection: 'row',
		alignItems: 'stretch',
		height: uiConfig.TOOLBAR_HEIGHT
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
		justifyContent: 'center',
		alignItems: 'center'
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
		color: uiConfig.COLORS.BLUE
	},

	spacer: {
		flex: 1
	}

});

module.exports = NavigatedView;
