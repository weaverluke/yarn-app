'use strict';

var React = require('react-native');

var Browser = require('./ios/app/views/browser/browser');
var Popup = require('./ios/app/views/popup/popup');
var StatusBar = require('./ios/app/views/statusbar/statusbar');
var Settings = require('./ios/app/views/settings/settings');
var MainBar = require('./ios/app/views/mainbar/mainbar');
var Toast = require('./ios/app/views/toast/toast');
var ToastContent = require('./ios/app/views/toast/wordscounttoastcontent');
var SearchingView = require('./ios/app/views/searching/searching');
var GuardianInfoView = require('./ios/app/views/guardianinfo/guardianinfo');
var NetworkErrorView = require('./ios/app/views/networkerror/networkerror');

var QuizStatusBar = require('./ios/app/views/quiz/quizstatusbar');
var QuestionView = require('./ios/app/views/quiz/question');
var ResultView = require('./ios/app/views/quiz/result');
var IntroView = require('./ios/app/views/intro/intro');

var gameStateStore = require('./ios/app/stores/gamestatestore');
var userProfileStore = require('./ios/app/stores/userprofilestore');
var actions = require('./ios/app/actions/actions');
var log = require('./ios/app/logger/logger');
var uiConfig = require('./ios/app/uiconfig');

var WHITELIST = require('./ios/app/whitelist');

var QUESTION_RESULT_TIMEOUT = 5000;

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
var DEFAULT_URL = 'http://www.theguardian.com/uk-news';
//var DEFAULT_URL = 'http://www.theguardian.com/us-news/2015/sep/13/donald-trump-ben-carson-republican-debate';
//DEFAULT_URL = 'http://www.theguardian.com/uk-news/2015/nov/23/undercover-police-target-hostile-reconnaissance-to-thwart-terror-attacks';

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
			browseOnToastVisible: false,
			testYourselfPromptVisible: false,
			testYourselfPromptShown: userProfileStore.get('testYourselfPromptShown'),
			// start with true, and when user profile is loaded then this flag will be set correctly in onUserProfileChanged
			introScreenShown: true,
			// is first word preloaded? (translations are ready and we can start the test)
			firstWordReady: false,
			guardianInfoViewVisible: false,
			networkErrorViewVisible: false
		};
	},

	nextQuestionTimeout: 0,
	showSearchingTimeout: 0,

	render: function () {
		console.log('render', this.state);
		var bottomBar = this.renderBottomBar();

		console.log('------------------------------------------------------------------');
		console.log('level', userProfileStore.get('level'));
		console.log('range', userProfileStore.get('range'));
		console.log('------------------------------------------------------------------');

		return (
			<View style={[styles.container]}>
				<View style={styles.content}>
					<Browser
						ref={BROWSER_REF}
						url={this.state.url}
						userLevel={userProfileStore.get('level')}
						userRange={userProfileStore.get('range')}
						onUrlChange={this.onUrlChange}
						onScroll={this.onBrowserScroll}
					/>
				{this.renderSettings()}
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
				{this.renderQuizStatusBar()}
				{this.renderSearchingState()}
				{this.renderToast()}
				{this.renderBrowseOnToast()}
				{this.renderIntroToast()}
				{this.renderResultView()}
				{this.renderTestYourselfPrompt()}
				{this.renderIntroScreen()}
				{this.renderGuardianInfoView()}
				{this.renderNetworkErrorView()}
				</View>
			</View>
		);
	},

	onShowDictionary: function (text, hasDictionaryDefinition) {
		clearTimeout(this.nextQuestionTimeout);
		this.refs.wordstrip.stopTimeoutAnimation();
		//if (hasDictionaryDefinition) {
		DictionaryProxy.showDefinition(text);
		//}
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
		var levelStats = userProfileStore.get('historyLevelValues');
		console.log('RESULTS: level:', Math.min(userProfileStore.get('level'), uiConfig.MAX_VOCAB_LEVEL),
			', prevLevel:', Math.min(levelStats[levelStats.length - 2], uiConfig.MAX_VOCAB_LEVEL));

		var previousLevel = levelStats.length > 1 ? levelStats[levelStats.length - 2] : levelStats[0];

		return (
			<ResultView
				correctWords={gameStateStore.get('correct')}
				totalWords={gameStateStore.get('pageWords').length}
				level={Math.min(userProfileStore.get('level'), uiConfig.MAX_VOCAB_LEVEL)}
				previousLevel={Math.min(previousLevel, uiConfig.MAX_VOCAB_LEVEL)}
				score={userProfileStore.get('score')}
				previousScore={userProfileStore.get('previousScore')}
				onDonePressed={this.closeResultView}
				onRandomPressed={this.onRandomPagePressed}
				buyVocabLevelShown={userProfileStore.get('buyVocabLevelShown')}
				buyVocabLevelPressed={userProfileStore.get('buyVocabLevelPressed')}
				onBuyVocabLevelPressed={this.onBuyVocabLevelPressed}
			/>
		);
	},

	onBuyVocabLevelPressed: function () {
		userProfileStore.set('buyVocabLevelPressed', true);
		userProfileStore.set('buyVocabLevelShown', true);
	},

	renderInfoBar: function () {
		console.log('render info bar, visited words:', gameStateStore.get('visitedPageWords').length);
		return (
			<StatusBar
				ref='wordscountbar'
				nextButtonDisabled={!this.state.firstWordReady}
				onNextPress={actions.emit.bind(actions, actions.START_GAME)}
				showWordsCount={true}
				wordsCount={gameStateStore.get('visitedPageWords').length}
				startHidden={true}
				onRandomPressed={this.onRandomPagePressed}
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
		return (
			<MainBar
				ref='mainbar'
				activeIcon={this.state.settingsViewVisible ? 'settings' : 'browse'}
				onRandomPressed={this.onRandomPagePressed}
			/>
		);
	},

	renderSettings: function () {
		return (
			<Settings
				ref='settings'
				visible={this.state.settingsViewVisible}
				lang={userProfileStore.get('language')}
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

	renderTestYourselfPrompt: function () {
		if (this.state.testYourselfPromptShown) {
			return;
		}
		return (
			<Popup
				ref='testYourselfPrompt'
				visible={this.state.testYourselfPromptVisible && this.state.firstWordReady && this.state.bottomBar === 'wordscount'}
				withoutOverlay={true}
				onSubmit={this.closeTestYourselfPrompt}
				type={Popup.POPUP_TYPE.TEST_YOURSELF_PROMPT}
			/>
		);
	},

	renderIntroScreen: function () {
		if (this.state.introScreenShown) {
			return;
		}
		return <IntroView lang={userProfileStore.get('language')} onSubmit={this.onIntroScreenSubmit} />;
	},

	onIntroScreenSubmit: function () {
		this.setState({
			introScreenShown: true
		});
		userProfileStore.set('introScreenShown', true);
	},

	showTestYourselfPrompt: function () {
		!this.state.testYourselfPromptShown && this.setState({
			testYourselfPromptVisible: true
		});
	},

	hideTestYourselfPrompt: function () {
		!this.state.testYourselfPromptShown && this.setState({
			testYourselfPromptVisible: false
		});
	},

	closeTestYourselfPrompt: function () {
		userProfileStore.set('testYourselfPromptShown', true);
		this.setState({
			testYourselfPromptVisible: false,
			testYourselfPromptShown: true
		});
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
			toastShown: false,
			translationsReady: false
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
		if (this.state.bottomBar === 'wordscount') {
			if (!this.state.wordsCountVisible && data.y > 10) {
				console.log('show wordscount bar');
				this.setState({
					wordsCountVisible: true
				});
				this.refs['mainbar'].animateOut();
				this.refs['wordscountbar'].animateIn(this.showTestYourselfPrompt);
			}
			else if (this.state.wordsCountVisible && data.y < 10) {
				console.log('hide wordscount bar');
				this.setState({
					wordsCountVisible: false
				});
				this.hideTestYourselfPrompt();
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
		if (this.state.bottomBar === 'result') {
			this.closeResultView(true);
		}
		this.refs[BROWSER_REF].goToRandomUrl();
	},

	showSettings: function () {
		this.setState({
			settingsViewVisible: true
		});
	},

	hideSettings: function () {
		this.setState({
			settingsViewVisible: false
		});
		this.refs['settings'].hide();
	},

	showNextQuestion: function () {
		console.log('SHOW NEXT QUESTION');
		clearTimeout(this.nextQuestionTimeout);
		this.setState({
			bottomBar: 'wordstrip'
		});
		actions.emit(actions.SHOW_NEXT_QUESTION);
	},

	renderGuardianInfoView: function () {
		if (this.state.guardianInfoViewVisible) {
			return (
				<GuardianInfoView onClose={this.hideGuardianInfoView} />
			)
		}
	},

	showGuardianInfoView: function () {
		this.setState({
			guardianInfoViewVisible: true
		});
	},

	hideGuardianInfoView: function () {
		this.setState({
			guardianInfoViewVisible: false
		});
	},

	renderNetworkErrorView: function () {
		if (this.state.networkErrorViewVisible) {
			return (
				<NetworkErrorView onClose={this.hideNetworkErrorView} />
			)
		}
	},

	showNetworkErrorView: function () {
		this.setState({
			networkErrorViewVisible: true
		});
	},

	hideNetworkErrorView: function () {
		this.setState({
			networkErrorViewVisible: false
		});

		setTimeout(function () {
			this.refs[BROWSER_REF].reload();
		}.bind(this), 1000);
	},

	componentDidMount: function () {
		this.lang = userProfileStore.get('language');

		gameStateStore.addChangeListener(this.onGameStateChanged);
		userProfileStore.addChangeListener(this.onUserProfileChanged);
		actions.on(actions.START_GAME, this.hideBottomBar);
		actions.on(actions.CHANGE_LEVEL, this.onForceChangeLevel);
		actions.on(actions.SETTINGS_BUTTON_PRESSED, this.showSettings);
		actions.on(actions.BROWSE_BUTTON_PRESSED, this.hideSettings);
		actions.on(actions.URL_FEATURE_REQUESTED, this.showUrlFeaturePopup);
		actions.on(actions.GUARDIAN_INFO_REQUESTED, this.showGuardianInfoView);
		actions.on(actions.NETWORK_ERROR_OCCURRED, this.showNetworkErrorView);
		actions.on(actions.TRY_AGAIN, this.hideNetworkErrorView);

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
			firstWordReady: gameStateStore.get('firstWordReady'),
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
		var profileLang = userProfileStore.get('language');
		if (profileLang && profileLang !== this.lang) {
			this.lang = profileLang;
			this.resetGame();
			this.reloadBrowser();
		}
		this.setState({
			testYourselfPromptShown: userProfileStore.get('testYourselfPromptShown'),
			// even if introScreenShown is true check also profileLang because if it's not selected user has to select it
			introScreenShown: userProfileStore.get('introScreenShown') && profileLang
		});
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

	content: {
		marginTop: uiConfig.IOS_STATUSBAR_HEIGHT,
		flex: 1
	},

	bottomBarWrap: {

	}
});


AppRegistry.registerComponent('yarn', () => yarn);
