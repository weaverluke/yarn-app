'use strict';

var React = require('react-native');
var {
    StyleSheet,
    View,
    Text,
    Image,
    Animated,
} = React;

var ANIMATION_TIME = 200;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');

var actions = require('../../actions/actions');
var uiConfig = require('../../uiconfig');

var RANDOM_MENU_ITEMS = [
    {
        label: 'tech',
		value: 'tech',
        icon: 'clock'
    },
    {
        label: 'sport',
		value: 'sport',
        icon: 'clock'
    },
    {
        label: 'lang',
		value: 'lang',
        icon: 'yarn'
    },
    {
        label: 'business',
		value: 'business',
        icon: 'refresh'
    },
    {
        label: 'surprise me',
		value: '', // empty as we want random entry
        icon: 'random'
    }
];

var RandomMenu = React.createClass({

	debounceIndex: 0,

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

        return (
            <Animated.View style={[styles.wrap, {
				transform: [
					{ translateY: this.state.marginTopValue }
				],
				opacity: this.state.opacityValue
			}]}>
                {items}
            </Animated.View>
        );
    },

	renderButton: function (btn, ind) {
		if (btn.label === 'lang') {
			btn.value = btn.label = this.props.lang.toLowerCase();
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
		actions.on(actions.RANDOM_BUTTON_PRESS, this.onRandomButtonPress);
		actions.on(actions.RANDOM_BUTTON_MOVE, this.onRandomButtonMove);
		actions.on(actions.RANDOM_BUTTON_RELEASE, this.onRandomButtonRelease);
	},

    componentWillReceiveProps: function (newProps) {
    },

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
        ]).start(cb);
    },


    hide: function (cb) {
        this.animateOut(cb);
    },

	show: function (cb) {
		this.animateIn(cb);
	},

	onRandomButtonPress: function (ev) {
		this.startPos = {
			x: ev.x,
			y: ev.y
		};
		this.debounceIndex = 0;
		this.show();
	},

	onRandomButtonMove: function (ev) {
		var newHighlightedIndex = this.state.highlightedIndex;

		// horizontal movement across the buttons
		if (height - ev.y > uiConfig.TOOLBAR_HEIGHT) {
			var deltaFromBottom = height - ev.y;
			newHighlightedIndex = this.state.items.length - Math.floor(deltaFromBottom / uiConfig.TOOLBAR_HEIGHT);
		}
		// area of random button
		else if (ev.x < uiConfig.TOOLBAR_BUTTON_WIDTH) {
			newHighlightedIndex = -1;
		}
		// vertical movement along bottom bar
		else {
			var distanceFromStartToEdge = width - Math.max(this.startPos.x, uiConfig.TOOLBAR_BUTTON_WIDTH);
			var delta = ev.x - this.startPos.x;
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

	onRandomButtonRelease: function (ev) {

		this.hide();
		var selectedItem = this.state.items[this.state.highlightedIndex];
		if (!selectedItem) {
			return;
		}

		this.props.onRandomSelected && this.props.onRandomSelected(selectedItem.value);

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
        bottom: uiConfig.TOOLBAR_HEIGHT,
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
	}
});

module.exports = RandomMenu;
