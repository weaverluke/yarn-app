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

var ANIMATION_TIME = 300;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');

var actions = require('../../actions/actions');
var uiConfig = require('../../uiconfig');

var RANDOM_MENU_ITEMS = [
    {
        label: 'tech',
        icon: 'clock'
    },
    {
        label: 'sport',
        icon: 'clock'
    },
    {
        label: 'lang',
        icon: 'yarn'
    },
    {
        label: 'business',
        icon: 'refresh'
    },
    {
        label: 'surprise me',
        icon: 'random'
    }
];

var RandomMenu = React.createClass({

    getInitialState: function () {
        return {
            items: RANDOM_MENU_ITEMS,
            opacityValue: new Animated.Value(0),
            marginTopValue: new Animated.Value(0),
			highlightedIndex: -1
        };
    },

    getDefaultProps: function () {
        return {
            lang: ''
        };
    },

    render: function () {
        var items = this.state.items.map(this.renderButton);
        console.log('rendered items', items);
        //var items = [];

        return (
            <Animated.View style={[styles.wrap, {
				transform: [
					{ translateY: this.state.marginTopValue }
				],
				opacity: this.state.opacityValue
			}]}>
                {items}
				<View
					style={styles.empty}
					onStartShouldSetResponder={function () {return true;}}
					onMoveShouldSetResponder={function () {return true;}}
					onResponderMove={this.onResponderMove}
					onResponderRelease={this.onResponderRelease}
				/>
            </Animated.View>
        );
    },

	renderButton: function (btn, ind) {
		if (btn.label === 'lang') {
			btn.label = this.props.lang.toLowerCase();
		}

		var highlighted = this.state.highlightedIndex === ind;
		var iconName = btn.icon + '-icon-' + (highlighted ? 'on.png' : 'off.png');
		var buttonStyles = [styles.button];
		var textStyles = [styles.buttonText];

		if (highlighted) {
			buttonStyles.push(styles.buttonActive);
			textStyles.push(styles.textActive);
		}

		return (
			<View style={buttonStyles} key={btn.label}>
				<View style={[styles.vCenter, styles.buttonImageWrap]}>
					<Image source={{uri: iconName}} style={styles.buttonImage}/>
				</View>
				<View style={styles.vCenter}>
					<Text style={textStyles}>{btn.label}</Text>
				</View>
			</View>
		);
	},

    componentDidMount: function () {
        //this.state.visible && this.animateIn();
        this.animateIn();
    },
    //
    //componentWillReceiveProps: function (newProps) {
    //    if (this.props.visible === newProps.visible) {
    //        return;
    //    }
    //    newProps.visible ? this.animateIn() : this.animateOut();
    //
    //    // we're changing from hidden to visible so we're updating currently set language
    //    if (!this.props.visible && newProps.visible) {
    //        this.animateIn();
    //        this.setState({lang: newProps.lang});
    //    }
    //
    //    // change from visible to hidden
    //    else if (this.props.visible && !newProps.visible) {
    //        this.animateOut();
    //        // lang has changed
    //        if (this.props.lang !== this.state.lang) {
    //            actions.emit(actions.CHANGE_LANG, this.state.lang);
    //        }
    //    }
    //},

    animateIn: function (cb) {
        Animated.parallel([
            Animated.timing(
                this.state.opacityValue,
                { toValue: 1, duration: ANIMATION_TIME }
            ),
            Animated.timing(
                this.state.marginTopValue,
                { toValue: 0, duration: ANIMATION_TIME }
            )
        ]).start(cb);
    },

    animateOut: function (cb) {
        Animated.parallel([
            Animated.timing(
                this.state.opacityValue,
                { toValue: 0, duration: ANIMATION_TIME }
            )
            //Animated.timing(
            //	this.state.marginTopValue,
            //	{ toValue: height }
            //)
        ]).start(cb);
    },


    hide: function (cb) {
        this.animateOut(cb);
    },

	onResponderMove: function (ev) {
		console.log('onResponderMove', ev.nativeEvent.pageX, ev.nativeEvent.pageY, ev.nativeEvent.locationX, ev.nativeEvent.locationY);
		if (!this.startPos) {
			this.startPos = {
				x: ev.nativeEvent.pageX,
				y: ev.nativeEvent.pageY
			};
			this.debounceIndex = 0;
			return;
		}

		// extremely simple debounce mechanism - use every 5th event
		this.debounceIndex++;
		if (this.debounceIndex > 5) {
			this.debounceIndex = 0;
			return;
		}

		var newHighlightedIndex = this.state.highlightedIndex;

		// horizontal movement across the buttons
		if (height - ev.nativeEvent.pageY > uiConfig.TOOLBAR_HEIGHT) {
			var deltaFromBottom = height - ev.nativeEvent.pageY;
			newHighlightedIndex = this.state.items.length - Math.floor(deltaFromBottom / uiConfig.TOOLBAR_HEIGHT);
		}
		// area of random button
		else if (ev.nativeEvent.pageX < uiConfig.TOOLBAR_BUTTON_WIDTH) {
			newHighlightedIndex = -1;
		}
		// vertical movement along bottom bar
		else {
			var distanceFromStartToEdge = width - Math.max(this.startPos.x, uiConfig.TOOLBAR_BUTTON_WIDTH);
			var delta = ev.nativeEvent.pageX - this.startPos.x;
			var distanceOfOneButton = distanceFromStartToEdge / this.state.items.length;
			var movedDistance = Math.ceil(delta / distanceOfOneButton);
			newHighlightedIndex = this.state.items.length - movedDistance;
		}

		if (this.state.highlightedIndex !== newHighlightedIndex) {
			this.setState({
				highlightedIndex: newHighlightedIndex
			});
		}
	},

	onResponderRelease: function (ev) {
		this.hide();
		if (this.state.highlightedIndex === -1) {
			return;
		}

		var selectedKey = this.state.items[this.state.highlightedIndex].label;
		this.props.onRandomSelected && this.props.onRandomSelected(selectedKey);

		this.startPos = undefined;
		this.setState({
			highlightedIndex: -1
		});
	}
});

var styles = StyleSheet.create({

    wrap: {
        width: width,
        position: 'absolute',
        bottom: 0,
		backgroundColor: 'transparent',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: -1
		},
		shadowOpacity: 0.3,
		shadowRadius: 1
    },

    button: {
		backgroundColor: 'white',
        height: uiConfig.TOOLBAR_HEIGHT,
        borderTopWidth: 1,
        borderTopColor: uiConfig.COLORS.MID_GREY,
		flexDirection: 'row',
		flex: 1
    },

	buttonImageWrap: {
		width: 50
	},

	buttonImage: {
		marginRight: 20,
		width: 25,
		height: 25,
		marginLeft: 10
	},

	buttonText: {
		fontSize: 30,
		lineHeight: 38,
		fontFamily: uiConfig.SPECIAL_FONT,
		color: uiConfig.COLORS.SELECTED_GREY,
		backgroundColor: 'transparent'
	},

	vCenter: {
		flexDirection: 'column',
		justifyContent: 'center'
	},

	textActive: {
		color: uiConfig.COLORS.BLUE
	},

	buttonActive: {
		backgroundColor: uiConfig.COLORS.PALE_BLUE
	},

	empty: {
		height: uiConfig.TOOLBAR_HEIGHT,
		backgroundColor: 'transparent'
	}

});

module.exports = RandomMenu;
