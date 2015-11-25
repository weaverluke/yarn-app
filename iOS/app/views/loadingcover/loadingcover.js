'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Animated
} = React;

var FADE_OUT_TIME = 700;

var LoadingCover = React.createClass({

	getInitialState: function () {
		return {
			opacityValue: new Animated.Value(1),
			hidden: false
		};
	},

	getDefaultProps: function () {
		return {
			active: true
		};
	},

	render: function () {
		// if it's hidden then render empty view
		if (this.state.hidden) {
			return <View />;
		}

		var wrapAnimationStyle = {
			opacity: this.state.opacityValue
		};

		return (
			<Animated.View style={[styles.wrap, wrapAnimationStyle]} />
		);
	},

	componentWillReceiveProps: function (props) {
		if (!props.active) {
			this.hide();
		}
	},

	animateOut: function (cb) {
		Animated.parallel([
			Animated.timing(
				this.state.opacityValue,
				{ toValue: 0, duration: FADE_OUT_TIME }
			)
		]).start(cb);
	},

	hide: function () {
		// do not set the same state again
		if (this.state.hidden) {
			return;
		}

		this.animateOut(function () {
			this.setState({hidden: true});
		}.bind(this));
	}

});

var styles = StyleSheet.create({
	wrap: {
		backgroundColor: 'white',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	}
});


module.exports = LoadingCover;
