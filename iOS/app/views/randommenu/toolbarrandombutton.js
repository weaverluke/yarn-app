'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	TouchableWithoutFeedback,
	Image,
	PanResponder
} = React;

var actions = require('../../actions/actions');

var uiConfig = require('../../uiconfig');

var ToolbarRandomButton = React.createClass({

	moveInProgress: false,
	debounceIndex: 0,

	componentWillMount: function () {
		if (uiConfig.USE_GESTURES_FOR_RANDOM_MENU) {
			this._panResponder = PanResponder.create({
				onStartShouldSetPanResponder: function (ev, gestureState) { return true; },
				onStartShouldSetPanResponderCapture: function (ev, gestureState) { return true; },
				onMoveShouldSetPanResponder: function (ev, gestureState) { return true; },
				onMoveShouldSetPanResponderCapture: function (ev, gestureState) { return true; },
				onPanResponderGrant: this.onPanResponderGrant,
				onPanResponderMove: this.onPanResponderMove,
				onPanResponderRelease: this.onPanResponderRelease
			});
		}
	},

	onPanResponderGrant: function (ev, gestureState) {
		actions.emit(actions.RANDOM_BUTTON_PRESS, {
			x: ev.nativeEvent.pageX,
			y: ev.nativeEvent.pageY
		});
	},

	onPanResponderMove: function (ev, gestureState) {
		actions.emit(actions.RANDOM_BUTTON_MOVE, {
			x: ev.nativeEvent.pageX,
			y: ev.nativeEvent.pageY
		});
	},

	onPanResponderRelease: function (ev, gestureState) {
		actions.emit(actions.RANDOM_BUTTON_RELEASE, {
			x: ev.nativeEvent.pageX,
			y: ev.nativeEvent.pageY
		});
	},

	render: function () {
		if (uiConfig.USE_GESTURES_FOR_RANDOM_MENU) {
			return (
				<View style={styles.wrap} {...this._panResponder.panHandlers}>
					<View style={styles.vCenter}>
						<Image style={styles.randomIcon} source={{uri: 'random-icon.png'}} />
					</View>
				</View>
			);
		}
		else {
			return (
				<TouchableWithoutFeedback onPress={this.onPress}>
					<View style={styles.wrap}>
						<View style={styles.vCenter}>
							<Image style={styles.randomIcon} source={{uri: 'random-icon.png'}} />
						</View>
					</View>
				</TouchableWithoutFeedback>
			);

		}
	},

	onPress: function () {
		actions.emit(actions.RANDOM_BUTTON_PRESS);
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
