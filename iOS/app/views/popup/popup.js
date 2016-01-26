var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	WebView,
	TouchableWithoutFeedback,
	TouchableHighlight,
	Animated,
	Image
} = React;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');

var uiConfig = require('../../uiconfig');
var COLORS = uiConfig.COLORS;
var utils = require('../../utils');
var actions = require('../../actions/actions');

var POPUP_TYPE = {
	INFO: 'INFO',
	ANSWER: 'ANSWER',
	BUY_URL_FEATURE: 'BUY_URL_FEATURE',
	TEST_YOURSELF_PROMPT: 'TEST_YOURSELF_PROMPT',
	BUY_VOCAB_LEVEL: 'BUY_VOCAB_LEVEL'
};


// margin from left and right edge
var POPUP_MARGIN = 10;

var ARROW_EDGE_WIDTH = 10;
var ARROW_WIDTH = ARROW_EDGE_WIDTH * Math.sqrt(2);
var ARROW_MIN_LEFT = POPUP_MARGIN + 3; // 3 for rounded corners

var Popup = React.createClass({

	getDefaultProps: function () {
		return {
			type: POPUP_TYPE.ANSWER,
			arrowRect: {x:0, y:0, width:0, height:0},
			withoutOverlay: false,
			buyButtonInFinalState: false
		};
	},

	getInitialState: function () {
		if (this.props.buyButtonInFinalState) {
			return {
				buttonAnimationFinished: true,
				buttonText: 'COMING SOON',
				buttonBgColor: uiConfig.COLORS.MID_GREY,
				// used for button width animation
				buttonWidth: new Animated.Value(130)
			};
		}

		return {
			buttonAnimationFinished: false,
			buttonText: '£1.69',
			buttonBgColor: uiConfig.COLORS.BLUE,
			// used for button width animation
			buttonWidth: new Animated.Value(50)
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

			case POPUP_TYPE.BUY_URL_FEATURE:
				content = this.renderBuyUrlFeaturePopup();
				break;

			case POPUP_TYPE.BUY_VOCAB_LEVEL:
				content = this.renderBuyVocabLevelPopup();
				break;

			case POPUP_TYPE.TEST_YOURSELF_PROMPT:
				content = this.renderTestYourselfPrompt();
				break;

			case POPUP_TYPE.ANSWER:
			default:
				content = this.renderAnswerPopup();
				break;
		}

		if (this.props.withoutOverlay) {
			return content;
		}
		else {
			return (
				<View style={styles.wrap}>
					<TouchableWithoutFeedback onPress={this.props.onClose}>
						<View style={styles.overlay} >
						</View>
					</TouchableWithoutFeedback>
				{content}
				</View>
			);
		}
	},

	renderInfoPopup: function () {
		var popupWidth = 180;//(width - 2*POPUP_MARGIN) * 0.6;
		var extraStyle = {
			width: popupWidth,
			left: POPUP_MARGIN,
			height: 60
		};
		var arrowLeft = this.computeArrowPosition();

		return (
			<View style={[styles.popup, extraStyle]}>
				<TouchableWithoutFeedback onPress={this.props.cancelPress}>
					<View style={[styles.contentWrap, styles.row]}>
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
				</TouchableWithoutFeedback>
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
				<TouchableWithoutFeedback onPress={this.props.cancelPress}>
					<View style={styles.contentWrap}>
						<Text style={styles.header}>{this.props.title}</Text>


						<WebView html={this.props.content} style={styles.webView}/>
						//<View style={styles.gradient}>
						//	<Image source={require('image!horizontal-gradient')} style={styles.gradientImage}/>
						//</View>

						<View style={styles.footer}>
							<TouchableWithoutFeedback onPress={this.props.onShowDictionary}>
								<View style={styles.dictionary}>
									<Text style={styles.dictionaryText}>Show native dictionary</Text>
								</View>
							</TouchableWithoutFeedback>
							<TouchableWithoutFeedback onPress={this.props.onSubmit}>
								<View style={styles.nextButton}>
									<View style={styles.nextButtonArrow}>
									</View>
								</View>
							</TouchableWithoutFeedback>
						</View>

					</View>
				</TouchableWithoutFeedback>
				<View style={[styles.arrow, {left: arrowLeft}]}>
				</View>
			</View>
		);
	},

	renderBuyUrlFeaturePopup: function () {
		var popupWidth = 200;//(width - 2*POPUP_MARGIN) * 0.6;
		var extraStyle = {
			top: 30,
			width: popupWidth,
			left: (width-popupWidth)/2,//POPUP_MARGIN,
			height: 100
		};
		var arrowLeft = popupWidth/2;// this.computeArrowPosition();

		var buttonStyle = {
			width: this.state.buttonWidth,
			backgroundColor: this.state.buttonBgColor
		};

		return (
			<View style={[styles.popup, extraStyle]}>
				<View style={[styles.contentWrap]}>
					<View>
						<View style={styles.row}>
							<Text>Add </Text>
							<Text style={styles.bold}>Web Browsing </Text>
							<Text>to</Text>
						</View>
						<Text>use Yarn across all your</Text>
						<Text>favourite webistes</Text>
					</View>
					<View style={styles.bottomActionButtonWrap}>
						<TouchableWithoutFeedback onPress={this.onBuyPressed}>
							<Animated.View style={[styles.actionButton, buttonStyle]}>
								<Text style={styles.confirmButtonText}>{this.state.buttonText}</Text>
							</Animated.View>
						</TouchableWithoutFeedback>
					</View>
				</View>
				<View style={[styles.arrowTop, {left: arrowLeft}]}>
				</View>
			</View>
		);

	},

	renderBuyVocabLevelPopup: function () {
		var popupWidth = 200;//(width - 2*POPUP_MARGIN) * 0.6;
		var extraStyle = {
			top: 260,
			width: popupWidth,
			right: 10,
			height: 100
		};
		var arrowLeft = popupWidth - 40;// this.computeArrowPosition();

		var buttonStyle = {
			width: this.state.buttonWidth,
			backgroundColor: this.state.buttonBgColor
		};

		return (
			<View style={[styles.popup, extraStyle]}>
				<View style={[styles.contentWrap]}>
					<View>
						<View style={styles.row}>
							<Text>Add </Text>
							<Text style={styles.bold}>Advanced Vocab </Text>
							<Text>to</Text>
						</View>
						<Text>test yourself on 63,241</Text>
						<Text>more difficult words!</Text>
					</View>
					<View style={styles.bottomActionButtonWrap}>
						<TouchableWithoutFeedback onPress={this.onBuyPressed}>
							<Animated.View style={[styles.actionButton, buttonStyle]}>
								<Text style={styles.confirmButtonText}>{this.state.buttonText}</Text>
							</Animated.View>
						</TouchableWithoutFeedback>
					</View>
				</View>
				<View style={[styles.arrowTop, {left: arrowLeft}]}>
				</View>
			</View>
		);

	},

	onBuyPressed: function () {
		var isAlreadyFinished = this.state.buttonAnimationFinished;

		this.setState({
			buttonAnimationFinished: true
		});

		var animationTime = 500;

		var startColor = utils.colorToObj(uiConfig.COLORS.BLUE);
		var finalColor = utils.colorToObj(uiConfig.COLORS.MID_GREY);
		actions.emit(actions.BUY_PREMIUM_VOCAB_LEVEL);

		//!isAlreadyFinished && setTimeout(function () {
		//
		//	utils.animateColor({
		//		start: startColor,
		//		end: finalColor,
		//		onChange: function (clr) {
		//			this.setState({
		//				buttonBgColor: utils.colorToString(clr)
		//			});
		//		}.bind(this),
		//		duration: animationTime,
		//		stepTime: 60
		//	});
		//
		//	Animated.timing(
		//		this.state.buttonWidth,
		//		{ toValue: 130, duration: animationTime }
		//	).start(function () {
		//		this.setState({
		//			buttonText: 'COMING SOON'
		//		});
		//	}.bind(this));
		//
		//}.bind(this), 100);
	},

	renderTestYourselfPrompt: function () {
		var popupWidth = 200;
		var extraStyle = {
			width: popupWidth,
			right: POPUP_MARGIN,
			height: 60
		};
		var buttonStyle = {
			backgroundColor: uiConfig.COLORS.SELECTED_GREY
		};
		var buttonTextStyle = {
			fontWeight: '500',
			color: 'white'
		};

		var arrowLeft = popupWidth - 40;

		return (
			<View style={[styles.popup, extraStyle]}>
				<TouchableWithoutFeedback onPress={this.props.cancelPress}>
					<View style={[styles.contentWrap, styles.row]}>
						<View>
							<Text>Test yourself</Text>
							<Text>any time!</Text>
						</View>
						<View>
							<TouchableHighlight onPress={this.props.onSubmit} underlayColor={uiConfig.COLORS.SELECTED_GREY_DIM}>
								<View style={[styles.confirmButton, buttonStyle]}>
									<Text style={[styles.confirmButtonText, buttonTextStyle]}>GOT IT</Text>
								</View>
							</TouchableHighlight>
						</View>
					</View>
				</TouchableWithoutFeedback>
				<View style={[styles.arrow, {left: arrowLeft}]}>
				</View>
			</View>
		);
	},

	computeArrowPosition: function () {
		return Math.max(this.props.arrowRect.x + this.props.arrowRect.width/2 - ARROW_WIDTH, ARROW_MIN_LEFT);
	},

	cancelPress: function (ev) {
		ev.preventDefault();
		ev.stopPropagation();
	}

});


var styles = StyleSheet.create({

	wrap: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		backgroundColor: 'rgba(0,0,0,0)',
		flex: 1
	},

	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		backgroundColor: 'rgba(0,0,0,0)',
		flex: 1
	},

	contentWrap: {
		position: 'absolute',
		top: 10,
		left: 10,
		bottom: 10,
		right: 10
	},

	webView: {
		borderWidth: 0,
		marginBottom: 5
	},

	popup: {
		position: 'absolute',
		//left: 10,
		bottom: uiConfig.TOOLBAR_HEIGHT + ARROW_WIDTH/2,
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderRadius: 3,
		height: 200,
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
		height: 30,
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#FFFFFF'
	},

	nextButton: {
		position: 'absolute',
		right: 0,
		top: 0,
		width: 30,
		height: 30,
		backgroundColor: COLORS.BLUE,
		borderRadius: 15
	},

	nextButtonArrow: {
		borderColor: 'rgba(0,0,0,0)',
		borderWidth: 8,
		borderRightWidth: 0,
		borderLeftColor: '#FFFFFF',
		position: 'absolute',
		top: 8,
		left: 12
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

	arrowTop: {
		position: 'absolute',
		top: -5,
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

	bold: {
		fontWeight: '500'
	},

	confirmButton: {
		backgroundColor: COLORS.GREEN,
		paddingBottom: 5,
		paddingLeft: 15,
		paddingRight: 15,
		marginTop: 7,
		marginLeft: 20,
		borderRadius: 3
	},

	bottomActionButtonWrap: {
		position: 'absolute',
		right: 0,
		bottom: 0
	},

	actionButton: {
		height: 25,
		borderRadius: 3
	},

	confirmButtonText: {
		textAlign: 'center',
		color: '#FFFFFF',
		marginTop: 4
	},

	gradientImage: {
		height: 20
	},

	gradient: {
		height: 20,
		backgroundColor: 'transparent',
		position: 'absolute',
		bottom: 20,
		left: 0,
		right: 0,
		overflow: 'hidden'
	},

	dictionary: {
		borderWidth: 1,
		borderRadius: 4,
		backgroundColor: uiConfig.COLORS.GREEN,
		position: 'absolute',
		padding: 5,
		top: 0,
		left: 0,
		//width: 150,
		height: 30
	},

	dictionaryText: {
		color: '#FFFFFF'
		//fontSize: 15,
	}

});

Popup.POPUP_TYPE = POPUP_TYPE;

module.exports = Popup;
