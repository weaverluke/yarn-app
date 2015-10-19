'use strict';

var React = require('react-native');

var Browser = require('./app/views/browser/browser');
var Popup = require('./app/views/popup/popup');
var StatusBar = require('./app/views/statusbar/statusbar');
var Settings = require('./app/views/settings/settings');
var MainBar = require('./app/views/mainbar/mainbar');
var Toast = require('./app/views/toast/toast');
var ToastContent = require('./app/views/toast/wordscounttoastcontent');
var SearchingView = require('./app/views/searching/searching');

var QuizStatusBar = require('./app/views/quiz/quizstatusbar');
var QuestionView = require('./app/views/quiz/question');
var ResultView = require('./app/views/quiz/result');

var gameStateStore = require('./app/stores/gamestatestore');
var userProfileStore = require('./app/stores/userprofilestore');
var actions = require('./app/actions/actions');
var log = require('./app/logger/logger');

var WHITELIST = require('./app/whitelist');

var QUESTION_RESULT_TIMEOUT = 3000;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');
console.log('DIM', width, height);

var {
	AppRegistry,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	WebView,
	LayoutAnimation,
	NativeAppEventEmitter
} = React;

var subscription = NativeAppEventEmitter.addListener(
	'DictionaryHidden',
	function () {
		console.log('Dictionary hidden!');
	}
);

var {
	DictionaryProxy
} = require('NativeModules');

var HEADER = '#F9FAFB';

var GAME_STATES = gameStateStore.GAME_STATES;

var BROWSER_REF = 'browser';
var DEFAULT_URL = 'http://www.theguardian.com/uk';
//var DEFAULT_URL = 'http://www.theguardian.com/us-news/2015/sep/13/donald-trump-ben-carson-republican-debate';

var yarn = React.createClass({

	getInitialState: function () {
		return {
			url: DEFAULT_URL,
			popupVisible: false,
			question: [],
			buttonRect: {},
			firstButtonRect: {},
			initialPopupVisible: false,
			settingsViewVisible: false,
			bottomBar: '',
			wordsCountVisible: false,
			toastShown: false,
			introToastShown: false,
			gameState: gameStateStore.GAME_STATES.NOT_STARTED,
			buyUrlFeaturePopupVisible: false,
			browseOnToastVisible: false
		};
	},

	nextQuestionTimeout: 0,
	showSearchingTimeout: 0,

	render: function () {
		console.log('render', this.state);
		var bottomBar = this.renderBottomBar();

		return (
			<View style={[styles.container]}>
				<Browser
					ref={BROWSER_REF}
					url={this.state.url}
					userLevel={userProfileStore.get('level')}
					userRange={userProfileStore.get('range')}
					onUrlChange={this.onUrlChange}
					onScroll={this.onBrowserScroll}
				/>
				<View style={styles.bottomBarWrap}>
					{this.renderMainBar()}
					{bottomBar}
				</View>
				<Popup
					visible={this.state.popupVisible}
					onClose={this.onPopupSubmit}
					onSubmit={this.onPopupSubmit}
					title={this.state.popupTitle}
					content={this.state.popupContent}
					arrowRect={this.state.buttonRect}
					onShowDictionary={this.onShowDictionary}
				/>
				<Popup
					visible={this.state.initialPopupVisible}
					onClose={this.closeInitialPopup}
					onSubmit={this.closeInitialPopup}
					type={Popup.POPUP_TYPE.INFO}
					arrowRect={this.state.firstButtonRect}
				/>
				<Popup
					visible={this.state.buyUrlFeaturePopupVisible}
					onClose={this.closeUrlFeaturePopup}
					onSubmit={this.buyUrlFeaturePressed}
					type={Popup.POPUP_TYPE.BUY_URL_FEATURE}
					/>
				{this.renderSettings()}
				{this.renderQuizStatusBar()}
				{this.renderSearchingState()}
				{this.renderToast()}
				{this.renderBrowseOnToast()}
				{this.renderIntroToast()}
				{this.renderResultView()}
			</View>
		);
	},

	onShowDictionary: function (text) {
		clearTimeout(this.nextQuestionTimeout);
		this.refs.wordstrip.stopTimeoutAnimation();
		DictionaryProxy.showDefinition(text);
	},

	renderQuizStatusBar: function () {
		if (this.state.bottomBar !== 'wordstrip') {
			return <View />;
		}

		var text = 'Word ' + (gameStateStore.get('currentWordIndex') + 1) +
			' of ' + gameStateStore.get('pageWords').length;

		return (
			<QuizStatusBar
				text={text}
				onCancelClick={this.stopQuiz}
			/>
		);
	},

	stopQuiz: function () {
		this.resetGame();
		this.refs['mainbar'].animateIn();
	},

	renderBottomBar: function () {
		switch (this.state.bottomBar) {
			case 'wordscount':
				return this.renderInfoBar();
			case 'wordstrip':
				return this.renderWordStrip();
			// result is now rendered as separate view
			//case 'result':
			//	return this.renderResultView();
			case 'mainbar':
				return this.renderMainBar();
			default:
				return (<View />);
		}
	},

	renderResultView: function () {
		if (this.state.bottomBar !== 'result') {
			return <View/>;
		}

		return (
			<ResultView
				correctWords={gameStateStore.get('correct')}
				totalWords={gameStateStore.get('pageWords').length}
				level={userProfileStore.get('level')}
				score={userProfileStore.get('score')}
				onDonePressed={this.closeResultView}
				onRandomPressed={this.onRandomPagePressed}
			/>
		);
	},

	renderInfoBar: function () {
		console.log('render info bar, visited words:', gameStateStore.get('visitedPageWords').length);
		return (
			<StatusBar
				ref='wordscountbar'
				nextText='Test me!'
				onNextPress={actions.emit.bind(actions, actions.START_GAME)}
				showWordsCount={true}
				wordsCount={gameStateStore.get('visitedPageWords').length}
				startHidden={true}
			/>
		);
	},

	renderWordStrip: function () {
		return (
			<QuestionView
				ref='wordstrip'
				disabled={this.state.wordStripDisabled}
				onAction={this.onWordPressed}
				onNextPress={this.showNextQuestion}
				onShowDictionary={this.onShowDictionary}
				words={this.state.question}
				onAnimateInEnd={this.highlightCurrentWord}
			/>
		);
	},

	highlightCurrentWord: function () {
		this.refs[BROWSER_REF].highlightWord(gameStateStore.get('currentWord').text);
	},

	renderMainBar: function () {
		return (<MainBar ref="mainbar"/>);
	},

	renderSettings: function () {
		if (!this.state.settingsViewVisible) {
			return (<View />);
		}

		return (
			<Settings
				onClose={this.closeSettingsView}
				initialLevel={userProfileStore.get('level')}
				initialLang={userProfileStore.get('language')}
			/>
		);
	},

	renderToast: function () {
		if (!this.state.toastShown && this.state.gameState === GAME_STATES.WORDS_FOUND) {
			var toastContent = <ToastContent count={gameStateStore.get('pageWords').length} />;
			return (
				<Toast
					fadeInTimeout={600}
					content={toastContent}
					onClose={this.hideToast}
					timeout={2000}
				/>
			);
		}
		return <View/>;
	},

	renderIntroToast: function () {
		if (!this.state.introToastShown) {
			return (
				<Toast
					content={'Choose a page...'}
					onClose={this.hideIntroToast}
				/>
			);
		}
		return <View/>;
	},

	renderBrowseOnToast: function () {
		if (this.state.browseOnToastVisible) {
			return (
				<Toast
					content={'Browse on...'}
					onClose={this.hideBrowseOnToast}
				/>
			);
		}
		return <View/>;

	},

	renderSearchingState: function () {
		return <SearchingView ref="searching" active={this.state.gameState === GAME_STATES.LOOKING_FOR_WORDS} />;
	},

	hideToast: function () {
		this.setState({
			toastShown: true
		});
	},

	hideIntroToast: function () {
		this.setState({
			introToastShown: true
		});
	},

	onUrlChange: function (url) {
		actions.emit(actions.RESET);
		this.setState({
			wordsCountVisible: false,
			toastShown: false
		});
		this.refs['mainbar'].animateIn();

		// run api only for allowed websites
		if (WHITELIST.doesMatch(url)) {
			this.showSearchingTimeout = setTimeout(function () {
				actions.emit(actions.LOOKING_FOR_WORDS);
			}, 1500);
		}

		//setTimeout(actions.emit.bind(null, actions.LOOKING_FOR_WORDS), 1000);
	},

	onBrowserScroll: function (data) {
		console.log('browser scroll', data);
		if (this.state.bottomBar === 'wordscount') {
			if (!this.state.wordsCountVisible && data.y > 10) {
				console.log('show wordscount bar');
				this.setState({
					wordsCountVisible: true
				});
				this.refs['mainbar'].animateOut();
				this.refs['wordscountbar'].animateIn();
			}
			else if (this.state.wordsCountVisible && data.y < 10) {
				console.log('hide wordscount bar');
				this.setState({
					wordsCountVisible: false
				});
				this.refs['mainbar'].animateIn();
				this.refs['wordscountbar'].animateOut();
			}
		}
	},

	closeResultView: function (suppressBrowseOnToast) {
		this.setState({
			bottomBar: '',
			wordsCountVisible: false
		});
		this.refs['mainbar'].animateIn();

		if (suppressBrowseOnToast !== true) {
			setTimeout(this.showBrowseOnToast, 300);
		}
	},

	showBrowseOnToast: function () {
		this.setState({
			browseOnToastVisible: true
		});
	},

	hideBrowseOnToast: function () {
		this.setState({
			browseOnToastVisible: false
		});
	},

	onRandomPagePressed: function () {
		this.closeResultView(true);
		this.refs[BROWSER_REF].goToRandomUrl();
	},

	showSettings: function () {
		this.setState({
			settingsViewVisible: true
		});
	},

	closeSettingsView: function () {
		this.setState({
			settingsViewVisible: false
		});
	},

	showNextQuestion: function () {
		clearTimeout(this.nextQuestionTimeout);
		this.setState({
			bottomBar: 'wordstrip'
		});
		actions.emit(actions.SHOW_NEXT_QUESTION);
	},

	componentDidMount: function () {
		this.lang = userProfileStore.get('language');

		gameStateStore.addChangeListener(this.onGameStateChanged);
		userProfileStore.addChangeListener(this.onUserProfileChanged);
		actions.on(actions.START_GAME, this.hideBottomBar);
		actions.on(actions.CHANGE_LEVEL, this.onForceChangeLevel);
		actions.on(actions.SETTINGS_BUTTON_PRESSED, this.showSettings);
		actions.on(actions.URL_FEATURE_REQUESTED, this.showUrlFeaturePopup);
		this.onUrlChange(this.state.url);
	},

	showUrlFeaturePopup: function () {
		this.setState({
			buyUrlFeaturePopupVisible: true
		})
	},

	closeUrlFeaturePopup: function () {
		this.setState({
			buyUrlFeaturePopupVisible: false
		})
	},

	buyUrlFeaturePressed: function () {
		console.log('BUY URL FEATURE');
		//this.closeUrlFeaturePopup();
	},

	_componentDidMount: function () {
		// override state (dev only);
		this.setState({
			bottomBar: 'result'
		});
	},

	hideBottomBar: function () {
		this.setState({
			bottomBar: ''
		});
	},

	onPopupSubmit: function () {
		this.setState({
			popupVisible: false
		});
		this.showNextQuestion();
	},

	onGameStateChanged: function () {
		if (this.state.gameState !== gameStateStore.get('currentState')) {
			console.log('---------------------------------');
			console.log('----', gameStateStore.get('currentState'), '----');
			console.log('---------------------------------');
		}

		if (gameStateStore.get('finished')) {
			this.finishGame();
			return;
		}

		var currentGameState = gameStateStore.get('currentState');

		var bottomBar = '';
		var wordStripDisabled = false;

		if (currentGameState === GAME_STATES.WORDS_FOUND && gameStateStore.get('pageWords').length) {
			bottomBar = 'wordscount';
		}
		// no words and not started game - hide all bars
		else if (currentGameState === GAME_STATES.WORDS_FOUND && !gameStateStore.get('pageWords').length) {
			bottomBar = '';
		}
		else if (
			currentGameState === GAME_STATES.WAITING_FOR_ANSWER ||
			currentGameState === GAME_STATES.WRONG_ANSWER_CHOSEN ||
			currentGameState === GAME_STATES.CORRECT_ANSWER_CHOSEN ) {
				bottomBar = 'wordstrip';
		}

		if (bottomBar === 'wordstrip') {
			wordStripDisabled = currentGameState !== GAME_STATES.WAITING_FOR_ANSWER;
		}

		if (currentGameState === GAME_STATES.WAITING_FOR_ANSWER) {
			setTimeout(function () {
				this.refs[BROWSER_REF].highlightWord(gameStateStore.get('currentWord').text);
			}.bind(this, 200));
		}

		if (currentGameState === GAME_STATES.CORRECT_ANSWER_CHOSEN || currentGameState == GAME_STATES.WRONG_ANSWER_CHOSEN) {
			this.nextQuestionTimeout = setTimeout(this.showNextQuestion, QUESTION_RESULT_TIMEOUT);
		}

		//var popupVisible = currentGameState === GAME_STATES.CORRECT_ANSWER_CHOSEN ||
		//		currentGameState === GAME_STATES.WRONG_ANSWER_CHOSEN;
		var popupVisible = false;

		var popupTitle = popupVisible ?
			(currentGameState == GAME_STATES.CORRECT_ANSWER_CHOSEN ? 'That\'s right!' : 'Oops...') : '';

		var definition;
		(gameStateStore.get('currentQuestion') || []).forEach(function (question) {
			if (question.def) {
				definition = question.def.entryContent
			}
		});

		//var initialPopupVisible = this.state.wordstripVisible && gameStateStore.get('currentWordIndex') === 0 &&
		//		currentGameState === GAME_STATES.WAITING_FOR_ANSWER;
		var initialPopupVisible = false;

		this.setState({
			question: gameStateStore.get('currentQuestion'),
			gameState: currentGameState,
			wordStripDisabled: wordStripDisabled,
			bottomBar: bottomBar,
			popupVisible: popupVisible,
			popupTitle: popupTitle,
			popupContent: definition,
			initialPopupVisible: initialPopupVisible
		});

		// if initial popup should be shown then we need to measure first button so we'll show arrow for that popup
		// correctly
		if (initialPopupVisible) {
			setTimeout(function () {
				this.refs['wordstrip'].getButtonRect(0, function (rect) {
					this.setState({
						firstButtonRect: rect
					});
				}.bind(this));
			}.bind(this), 300);
		}
	},

	finishGame: function () {
		this.refs[BROWSER_REF].unhighlightWords();
		this.setState({
			bottomBar: !!gameStateStore.get('pageWords').length ? 'result' : '',
			popupVisible: false,
			infoBarVisible: false,
			wordstripVisible: false
		});
		log({
			message: 'game finished',
			correctWords: gameStateStore.get('correct'),
			totalWords: gameStateStore.get('pageWords').length,
			level: userProfileStore.get('level'),
			score: userProfileStore.get('score')
		});
	},

	onWordPressed: function (word, index) {
		// first word pressed - just scroll to it
		if (index === 0) {
			this.refs[BROWSER_REF].scrollToWord(word);
			return;
		}

		actions.emit(actions.WORD_PRESSED, word);
	},

	closeInitialPopup: function () {
		this.setState({
			initialPopupVisible: false
		});
	},

	onUserProfileChanged: function () {
		if (this.lang !== userProfileStore.get('language')) {
			this.lang = userProfileStore.get('language');
			this.resetGame();
			this.reloadBrowser();
		}
	},

	resetGame: function () {
		this.refs[BROWSER_REF].unhighlightWords();

		clearTimeout(this.showSearchingTimeout);
		clearTimeout(this.showSearchingTimeout);

		this.setState({
			question: [],
			bottomBar: '',
			toastShown: false
		});
	},

	onForceChangeLevel: function () {
		this.resetGame();
		this.reloadBrowser();
	},

	reloadBrowser: function () {
		this.refs[BROWSER_REF].resetLastParsedContent();
		this.refs[BROWSER_REF].reload();
	}

});

var styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: HEADER
	},

	bottomBarWrap: {

	}
});


AppRegistry.registerComponent('yarn', () => yarn);
