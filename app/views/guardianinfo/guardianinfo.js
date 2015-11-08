'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	TouchableHighlight,
	Image,
	Animated,
} = React;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');
var uiConfig = require('../../uiconfig');

var Guardian = React.createClass({

	getInitialState: function () {
		return {
			opacityValue: new Animated.Value(1),
			marginTopValue: new Animated.Value(height)
		};
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
					<TouchableWithoutFeedback onPress={this.onClose}>
						<View style={styles.leftContent}>
							<Text style={styles.backIcon}>&#x25C5;</Text>
							<Text style={styles.clickableText}>Back</Text>
						</View>
					</TouchableWithoutFeedback>
					<View style={styles.centerContent}>
						<Text style={styles.centerText}>Got The Guardian app?</Text>
					</View>
					<View style={styles.rightContent}>
					</View>
				</View>

				<View style={styles.topImageBox}>
					<Image source={{uri: 'guardian-top.png'}} style={[styles.wideImage, styles.topImage]} />
				</View>

				<View style={styles.contentImageBox}>
					<Image source={{uri: 'guardian-content.png'}} style={[styles.wideImage]} />
				</View>

			</Animated.View>
		);
	},

	componentDidMount: function () {
		this.animateIn();
	},

	animateIn: function (cb) {
		Animated.parallel([
			//Animated.timing(
			//	this.state.opacityValue,
			//	{ toValue: 1 }
			//),
			Animated.timing(
				this.state.marginTopValue,
				{ toValue: 0 }
			)
		]).start(cb);
	},

	animateOut: function (cb) {
		Animated.parallel([
			//Animated.timing(
			//	this.state.opacityValue,
			//	{ toValue: 0 }
			//),
			Animated.timing(
				this.state.marginTopValue,
				{ toValue: height }
			)
		]).start(cb);
	},


	onClose: function () {
		this.animateOut(this.props.onClose);
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

	wideImage: {
		flex: 1,
		resizeMode: Image.resizeMode.contain
	},

	topImageBox: {
		justifyContent: 'flex-start',
		height: 100
	},

	contentImageBox: {
		flex: 1
	}

});

module.exports = Guardian;
