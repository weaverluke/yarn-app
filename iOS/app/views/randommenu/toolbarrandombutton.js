'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	TouchableWithoutFeedback,
	Image
} = React;

var actions = require('../../actions/actions');

var uiConfig = require('../../uiconfig');

var ToolbarRandomButton = React.createClass({

	moveInProgress: false,

	render: function () {
		return (
			<View
				style={styles.wrap}
				onStartShouldSetResponder={function () {return true;}}
				onMoveShouldSetResponder={function () {return true;}}
				onResponderMove={this.onResponderMove}
				onResponderRelease={this.onResponderRelease}
			>
				<View style={styles.vCenter}>
					<Image style={styles.randomIcon} source={{uri: 'random-icon.png'}} />
				</View>
			</View>
		);
	},

	onResponderMove: function (ev) {
		console.log('button.onResponderMove');
		if (!this.moveInProgress) {
			this.moveInProgress = true;
			actions.emit(actions.RANDOM_BUTTON_PRESS, ev);
			return;
		}
		actions.emit(actions.RANDOM_BUTTON_MOVE, ev);
	},

	onResponderRelease: function (ev) {
		console.log('button.onResponderRelease');
		actions.emit(actions.RANDOM_BUTTON_RELEASE, ev);
		this.moveInProgress = false;
	}

});

var styles = StyleSheet.create({

	wrap: {
		height: uiConfig.TOOLBAR_HEIGHT,
		backgroundColor: uiConfig.COLORS.LIGHTEST_GREY,
		flexDirection: 'row',
		justifyContent: 'center',
		flex: 1
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
