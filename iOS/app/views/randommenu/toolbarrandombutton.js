'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	TouchableWithoutFeedback,
	Image
} = React;

var uiConfig = require('../../uiconfig');

var ToolbarRandomButton = React.createClass({

	render: function () {
		return (
			<TouchableWithoutFeedback style={{backgroundColor: 'red'}} onPressIn={this.props.onPress}>
				<View style={styles.wrap}>
					<View style={styles.vCenter}>
						<Image style={styles.randomIcon} source={{uri: 'random-icon.png'}} />
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	}

});

var styles = StyleSheet.create({

	wrap: {
		width: uiConfig.TOOLBAR_BUTTON_WIDTH,
		height: uiConfig.TOOLBAR_HEIGHT,
		backgroundColor: uiConfig.COLORS.LIGHT_GREY,
		shadowColor: '#000000',
		shadowOffset: {
			width: 1,
			height: 0
		},
		shadowOpacity: 0.3,
		shadowRadius: 1,
		flexDirection: 'row',
		justifyContent: 'center'
	},

	vCenter: {
		flexDirection: 'column',
		justifyContent: 'center'
	},

	randomIcon: {
		width: uiConfig.TOOLBAR_ICON_SIZE + 8,
		height: uiConfig.TOOLBAR_ICON_SIZE + 8
	}

});

module.exports = ToolbarRandomButton;
