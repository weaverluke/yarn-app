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

var NavigatedView = require('../navigatedview/navigatedview');

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');
var uiConfig = require('../../uiconfig');

var NetworkError = React.createClass({

	render: function () {

		var content = (
			<View style={styles.contentWrap}>
				<Text style={styles.mainText}>We seem to be having a problem loading data...</Text>
				<Text style={styles.secondLevelText}>Please check your internet connection and try again.</Text>

				<View style={styles.flex}>
					<Image source={{uri: 'network-error.png'}} style={styles.wideImage} />
				</View>
			</View>

		);

		return (
			<NavigatedView
				content={content}
				backText={'Try again'}
				titleText={'Connection issue'}
				actionText={'Try again'}
				onBackPressed={this.props.onClose}
				onActionPressed={this.props.onClose}
				animateOpacity={false}
			/>
		)

	}

});

var styles = StyleSheet.create({

	contentWrap: {
		backgroundColor: uiConfig.COLORS.INTRO_BG,
		flex: 1
	},

	wideImage: {
		flex: 1,
		resizeMode: Image.resizeMode.contain,
		marginTop: -60
	},

	mainText: {
		fontFamily: uiConfig.SPECIAL_FONT,
		fontSize: 30,
		lineHeight: 28,
		marginLeft: 20,
		marginRight: 20,
		marginTop: 30,
		color: uiConfig.COLORS.SELECTED_GREY
	},

	secondLevelText: {
		marginLeft: 20,
		marginRight: 20,
		marginTop: 25,
		fontSize: 18,
		color: uiConfig.COLORS.SELECTED_GREY
	},

	flex: {
		flex: 1
	}

});

module.exports = NetworkError;

