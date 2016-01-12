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
		this._panResponder = PanResponder.create({
			onStartShouldSetPanResponder: function (ev, gestureState) { return true; },
			onStartShouldSetPanResponderCapture: function (ev, gestureState) { return true; },
			onMoveShouldSetPanResponder: function (ev, gestureState) { return true; },
			onMoveShouldSetPanResponderCapture: function (ev, gestureState) { return true; },
			onPanResponderGrant: this.onPanResponderGrant,
			onPanResponderMove: this.onPanResponderMove,
			onPanResponderRelease: this.onPanResponderRelease
		});
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
		return (
			<View style={styles.wrap} {...this._panResponder.panHandlers}>
				<View style={styles.vCenter}>
					<Image style={styles.randomIcon} source={{uri: 'random-icon.png'}} />
				</View>
			</View>
		);
	},

	//onResponderMove: function (ev) {
	//	// extremely simple debounce mechanism - use every 5th event
	//	this.debounceIndex++;
	//	if (this.debounceIndex > 5) {
	//		this.debounceIndex = 0;
	//		return;
	//	}
	//
	//	console.log('button.onResponderMove');
	//	if (!this.moveInProgress) {
	//		this.moveInProgress = true;
	//		actions.emit(actions.RANDOM_BUTTON_PRESS, {
	//			x: ev.nativeEvent.pageX,
	//			y: ev.nativeEvent.pageY
	//		});
	//		return;
	//	}
	//	actions.emit(actions.RANDOM_BUTTON_MOVE, {
	//		x: ev.nativeEvent.pageX,
	//		y: ev.nativeEvent.pageY
	//	});
	//},
	//
	//onResponderRelease: function (ev) {
	//	console.log('button.onResponderRelease');
	//	actions.emit(actions.RANDOM_BUTTON_RELEASE, ev);
	//	this.moveInProgress = false;
	//}

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
