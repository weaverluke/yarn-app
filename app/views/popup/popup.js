var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	WebView,
	TouchableWithoutFeedback
} = React;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');

var POPUP_TYPE = {
	INFO: 'INFO',
	ANSWER: 'ANSWER'
};

var ARROW_EDGE_WIDTH = 10;
var ARROW_WIDTH = ARROW_EDGE_WIDTH * Math.sqrt(2);

// margin from left and right edge
var POPUP_MARGIN = 10;

var Popup = React.createClass({

	getDefaultProps: function () {
		return {
			type: POPUP_TYPE.ANSWER,
			arrowRect: {x:0, y:0, width:0, height:0}
		};
	},

	render: function () {
		if (!this.props.visible) {
			return (<View />);
		}

		var content;

		switch (this.props.type) {
			case POPUP_TYPE.INFO:
				content = this.renderInfoPopup();
				break;

			case POPUP_TYPE.ANSWER:
			default:
				content = this.renderAnswerPopup();
				break;
		}

		return (
			<TouchableWithoutFeedback onPress={this.props.onClose}>
				<View style={styles.overlay} >
					{content}
				</View>
			</TouchableWithoutFeedback>
		);
	},

	renderInfoPopup: function () {
		var popupWidth = (width - 2*POPUP_MARGIN) * 0.6;
		var extraStyle = {
			width: popupWidth,
			left: POPUP_MARGIN,
			height: 60
		};
		var arrowLeft = this.computeArrowPosition();

		return (
			<View style={[styles.popup, extraStyle]}>
				<View style={styles.row}>
					<View>
						<Text>Tap the best</Text>
						<Text>translation...</Text>
					</View>
					<View>
						<TouchableWithoutFeedback onPress={this.props.onSubmit}>
							<View style={styles.confirmButton}>
								<Text style={styles.confirmButtonText}>OK</Text>
							</View>
						</TouchableWithoutFeedback>
					</View>
				</View>

				<View style={[styles.arrow, {left: arrowLeft}]}>
				</View>
			</View>
		);
	},

	renderAnswerPopup: function () {
		var popupWidth = (width - 2*POPUP_MARGIN);// * (this.props.type === POPUP_TYPE.INFO ? 0.6 : 1);
		var extraStyle = {
			width: popupWidth,
			left: POPUP_MARGIN
		};
		var arrowLeft = this.computeArrowPosition();

		return (
			<View style={[styles.popup, extraStyle]}>
				<Text style={styles.header}>{this.props.title}</Text>

				<WebView html={this.props.content} style={styles.webView}/>

				<View style={styles.footer}>
					<TouchableWithoutFeedback onPress={this.props.onSubmit}>
						<View style={styles.nextButton}>
							<View style={styles.nextButtonArrow}>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</View>

				<View style={[styles.arrow, {left: arrowLeft}]}>
				</View>
			</View>
		);
	},

	computeArrowPosition: function () {
		return this.props.arrowRect.x + this.props.arrowRect.width/2 - ARROW_WIDTH;
	}

});


var styles = StyleSheet.create({

	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		backgroundColor: 'rgba(0,0,0,0)',
		flex: 1
	},

	webView: {
		borderWidth: 0,
		marginBottom: 30
	},

	popup: {
		position: 'absolute',
		left: 10,
		bottom: 25,
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderRadius: 3,
		height: 200,
		padding: 10,
		paddingBottom: 0,
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.5,
		shadowRadius: 3
	},

	header: {
		fontWeight: '700'
	},

	footer: {
		height: 20,
		paddingTop: 10,
		position: 'absolute',
		bottom: 15,
		left: 0,
		right: 0
	},

	nextButton: {
		position: 'absolute',
		right: 0,
		width: 20,
		height: 20,
		backgroundColor: '#27AAE1',
		borderRadius: 10
	},
	nextButtonArrow: {
		borderColor: 'rgba(0,0,0,0)',
		borderWidth: 5,
		borderRightWidth: 0,
		borderLeftColor: '#FFFFFF',
		position: 'absolute',
		top: 5,
		left: 8
	},
	arrow: {
		position: 'absolute',
		bottom: -5,
		left: 20,
		width: ARROW_EDGE_WIDTH,
		height: ARROW_EDGE_WIDTH,
		backgroundColor: '#FFFFFF',
		transform: [
			{
				rotate: '45deg'
			}
		]
	},

	row: {
		flexDirection: 'row'
	},

	confirmButton: {
		backgroundColor: '#22FF22',
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 15,
		paddingRight: 15,
		marginTop: 7,
		marginLeft: 20,
		borderRadius: 3
	},

	confirmButtonText: {
		color: '#FFFFFF'
	}

});

Popup.POPUP_TYPE = POPUP_TYPE;

module.exports = Popup;
