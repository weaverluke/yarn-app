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
var LoadingCoverView = require('./ios/app/views/loadingcover/loadingcover');
var LangPicker = require('./ios/app/views/langpicker/langpicker');
var RandomMenu = require('./ios/app/views/randommenu/randommenu');

var QuizStatusBar = require('./ios/app/views/quiz/quizstatusbar');
var QuestionView = require('./ios/app/views/quiz/question');
var ResultView = require('./ios/app/views/quiz/result');
var IntroView = require('./ios/app/views/intro/intro');
var Analytics = require('./ios/app/helpers/analytics');

var GuardianAPI = require('./ios/app/apis/guardian');

var gameStateStore = require('./ios/app/stores/gamestatestore');
var userProfileStore = require('./ios/app/stores/userprofilestore');
var actions = require('./ios/app/actions/actions');
var log = require('./ios/app/logger/logger');
var config = require('./ios/app/config');

var WHITELIST = require('./ios/app/whitelist');

var QUESTION_RESULT_TIMEOUT = 5000;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');
console.log('DIM', width, height);

var {
	AppRegistry,
	StyleSheet,
	View,
	LinkingIOS,
	AlertIOS

	//LayoutAnimation
	//NativeAppEventEmitter
} = React;

ErrorUtils.setGlobalHandler(function (err) {
	log({
		message: 'JS Execution Error',
		error: {
			message: err.message,
			stack: err.stack
		}
	});
	// do not show errors from react-native-webview-bridge as these do not break the app
	if (!/RCTWebViewManager\.onMessage/.test(err.message)) {
		AlertIOS.alert('Ops!', 'Looks like we\'ve encountered an error. Please restart the app if it behaves weirdly');
	}
});

//var subscription = NativeAppEventEmitter.addListener(
//	'DictionaryHidden',
//	function () {
//		console.log('Dictionary hidden!');
//	}
//);

var {
	DictionaryProxy
} = require('NativeModules');

var HEADER = '#F9FAFB';

var GAME_STATES = gameStateStore.GAME_STATES;

var BROWSER_REF = 'browser';

var yarn = React.createClass({

	getInitialState: function () {
		return {
			url: '',
			popupVisible: false,
			question: [],
			buttonRect: {},
			firstButtonRect: {},
			initialPopupVisible: false,
			settingsViewVisible: false,
			bottomBar: '',
			wordsCountVisible: false,
			toastShown: false,
			currentCategory: '',
			introToastShown: false,
			gameState: gameStateStore.GAME_STATES.NOT_STARTED,
			buyUrlFeaturePopupVisible: false,
			browseOnToastVisible: false,
			testYourselfPromptVisible: false,
			testYourselfPromptShown: userProfileStore.get('testYourselfPromptShown'),
			// is first word preloaded? (translations are ready and we can start the test)
			firstWordReady: false,
			guardianInfoViewVisible: false,
			networkErrorViewVisible: false,
			loadingCoverVisible: true,
			introScreenVisible: true,
			randomMenuVisible: false
		};
	},

	nextQuestionTimeout: 0,
	showSearchingTimeout: 0,

	render: function () {
		//console.log('render', this.state);
		var bottomBar = this.renderBottomBar();

		//console.log('------------------------------------------------------------------');
		//console.log('level', userProfileStore.get('level'));
		//console.log('range', userProfileStore.get('range'));
		//console.log('------------------------------------------------------------------');

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
					{this.renderSearchingState()}
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
				{this.renderToast()}
				{this.renderBrowseOnToast()}
				{this.renderIntroToast()}
				{this.renderResultView()}
				{this.renderTestYourselfPrompt()}
                {this.renderRandomMenu()}
				{this.renderIntroView()}
				{this.renderGuardianInfoView()}
				{this.renderNetworkErrorView()}
				{this.renderLoadingCover()}
				</View>
			</View>
		);
	},

	renderLoadingCover: function () {
		// as long as we're waiting for user profile to be loaded from async storage we cover whole app with white
		// screen to make sure that user will see correct state when data is loaded
		return <LoadingCoverView active={this.state.loadingCoverVisible} />
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
			' of ' + gameStateStore.get('quizWords').length;

		return (
			<QuizStatusBar
				text={text}
				onCancelClick={this.stopQuiz}
			/>
		);
	},

	stopQuiz: function () {
		Analytics.event('Test flow', 'Quiz cancelled');
		var shouldScrollBack = gameStateStore.get('singleWordMode');
		this.resetGame();
		this.refs['mainbar'].animateIn();

		if (shouldScrollBack) {
			setTimeout(function () {
				this.refs[BROWSER_REF].restoreScroll();
			}.bind(this), 100);
		}
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
		console.log('RESULTS: level:', Math.min(userProfileStore.get('level'), config.MAX_VOCAB_LEVEL),
			', prevLevel:', Math.min(levelStats[levelStats.length - 2], config.MAX_VOCAB_LEVEL));

		var previousLevel = levelStats.length > 1 ? levelStats[levelStats.length - 2] : levelStats[0];

		return (
			<ResultView
				correctWords={gameStateStore.get('correct')}
				totalWords={gameStateStore.get('correct') + gameStateStore.get('wrong')}
				level={Math.min(userProfileStore.get('level'), config.MAX_VOCAB_LEVEL)}
				previousLevel={Math.min(previousLevel, config.MAX_VOCAB_LEVEL)}
				score={userProfileStore.get('score')}
				previousScore={userProfileStore.get('previousScore')}
				onDonePressed={this.closeResultView}
				onBuyVocabLevelPressed={this.onBuyVocabLevelPressed}
			/>
		);
	},

	onBuyVocabLevelPressed: function () {
		Analytics.event('Buy Premium Feature', 'Buy Vocab Level');
		actions.emit(actions.BUY_PREMIUM_VOCAB_LEVEL);
	},

	renderInfoBar: function () {
		//console.log('render info bar, visited words:', gameStateStore.get('visitedPageWords').length);
		return (
			<StatusBar
				ref='wordscountbar'
				nextButtonDisabled={!this.state.firstWordReady}
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
				isSingleWordMode={gameStateStore.get('singleWordMode')}
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

			if (this.refs['introToast']) {
				this.refs['introToast'].hide();
			}

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
					ref='introToast'
					content={'loading...'}
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

	renderRandomMenu: function () {
		var lang = LangPicker.getLanguageName(userProfileStore.get('language')).toLowerCase();
		var items = this.getMostReadCategoriesForRandomMenu(2);

		if (this.state.bottomBar !== 'result') {
			items.unshift({
				label: 'open in Safari',
				query: '_safari_',
				icon: 'external'
			});
		}

		items.push({
			label: lang,
			query: lang,
			icon: 'yarn'
		});

		if (this.state.currentCategory) {
			items.push({
				label: this.state.currentCategory.name.toLowerCase(),
				sectionId: this.state.currentCategory.id,
				icon: 'refresh'
			});
		}

		items.push({
			label: 'surprise me',
			icon: 'random'
		});


		if (lang) {
			return <RandomMenu
				onRandomSelected={this.onRandomPagePressed}
				items={items}
			/>;
		}
	},

	getMostReadCategoriesForRandomMenu: function (amount) {
		var categories = userProfileStore.get('selectedCategories');
		var sortedCatIds = Object.keys(categories).sort(function (catA, catB) {
			return categories[catA].counter - categories[catB].counter;
		});

		var output = [];
		for (var i = 0; i < amount && sortedCatIds[i]; i++) {
			var currentCatId = sortedCatIds[i];
			output.push({
				label: categories[currentCatId].name.toLowerCase(),
				sectionId: currentCatId,
				icon: 'clock'
			});
		}
		return output;
	},

	renderIntroView: function () {
		if (this.state.introScreenVisible) {
			return <IntroView lang={userProfileStore.get('language')} onSubmit={this.onIntroViewSubmit} />;
		}
	},

	onIntroViewSubmit: function () {
		this.setState({
			introScreenVisible: false
		});
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
		console.log('onUrlChange', url);
		this.setState({
			url: url,
			wordsCountVisible: false,
			translationsReady: false
		});
		actions.emit(actions.RESET);
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
				//console.log('show wordscount bar');
				this.setState({
					wordsCountVisible: true
				});
				this.refs['mainbar'].animateOut();
				this.refs['wordscountbar'].animateIn(this.showTestYourselfPrompt);
			}
			else if (this.state.wordsCountVisible && data.y < 10) {
				//console.log('hide wordscount bar');
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

	onRandomButtonPressed: function () {
		this.setState({
			randomMenuVisible: true
		});
	},

	onRandomPagePressed: function (config) {
		if (config.query === '_safari_') {
			LinkingIOS.canOpenURL(this.state.url, function (supported) {
				if (!supported) {
					AlertIOS.alert('Can\'t handle url: ' + this.state.url);
				} else {
					LinkingIOS.openURL(this.state.url);
				}
			}.bind(this));

		}

		if (config.sectionId) {
			actions.emit(actions.RANDOM_CATEGORY_SELECTED, {
				id: config.sectionId,
				name: config.label
			});
		}

		if (this.state.bottomBar === 'result') {
			this.closeResultView(true);
		}
		//var langName = LangPicker.getLanguageName(userProfileStore.get('language'));
		GuardianAPI.getUniqueMostViewed(config)
			.then(function (result) {
				this.setState({
					url: result.url,
					currentCategory: {
						name: result.sectionName,
						id: result.sectionId
					}
				});
		}.bind(this));
		//this.refs[BROWSER_REF].goToRandomUrl();
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
		//this.setState({
		//	bottomBar: 'wordstrip'
		//});
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
		// these states mean that we didn't start the quiz so we have to reloadthe page to be sure
		// that everything is loaded correctly
		var notAllowedGameStates = [
			GAME_STATES.NOT_STARTED,
			GAME_STATES.LOOKING_FOR_WORDS
		];
		if (notAllowedGameStates.indexOf(this.state.gameState) === -1) {
			return;
		}

		// if game state is set to WORDS_FOUND then trigger that state again to start translation
		// and do not refresh the page
		if (this.state.gameState === GAME_STATES.WORDS_FOUND) {
			gameStateStore.set('currentState', GAME_STATES.WORDS_FOUND);
			return;
		}

		this.resetViews();

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

		GuardianAPI.getUniqueMostViewed().then(function (result) {
			this.setState({
				url: result.url,
				currentCategory: {
					name: result.sectionName,
					id: result.sectionId
				}
			});
			this.state.networkErrorViewVisible && this.hideNetworkErrorView();
		}.bind(this));

		this.onUrlChange(this.state.url);

		log({
			message: 'componentDidMount',
			state: this.state,
			lang: userProfileStore.get('language')
		});

		if (userProfileStore.get('language') || userProfileStore.get('loaded')) {
			this.onUserProfileChanged();
		}
	},

	showUrlFeaturePopup: function () {
		// do not show popup for now
		//this.setState({
		//	buyUrlFeaturePopupVisible: true
		//});
		this.buyUrlFeaturePressed();
	},

	closeUrlFeaturePopup: function () {
		this.setState({
			buyUrlFeaturePopupVisible: false
		});
	},

	buyUrlFeaturePressed: function () {
		Analytics.event('Buy Premium Feature', 'Buy Web Browsing');
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
		//// quickly terminate if game was not started
		//if (this.state.gameState === gameStateStore.get('currentState') &&
		//		this.state.gameState === GAME_STATES.NOT_STARTED) {
		//	return;
		//}

		if (this.state.gameState !== gameStateStore.get('currentState')) {
			console.log('---------------------------------');
			console.log('----', gameStateStore.get('currentState'), '----');
			console.log('---------------------------------');
		}

		var currentGameState = gameStateStore.get('currentState');
		var toastShown = this.state.toastShown;

		if (currentGameState === GAME_STATES.LOOKING_FOR_WORDS) {
			toastShown = false;
		}

		if (gameStateStore.get('finished')) {
			if (gameStateStore.get('singleWordMode') && currentGameState === GAME_STATES.WORDS_FOUND) {
				this.handleSingleWordGameFinish();
			}
			else {
				this.finishGame();
			}
			return;
		}

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

		// scroll to word if we're waiting for anser and this is not the first (index 0) word in quiz
		// as the app will scroll to first word automatically when quiz view appears
		if (currentGameState === GAME_STATES.WAITING_FOR_ANSWER && gameStateStore.get('currentWordIndex')) {
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
			toastShown: toastShown,
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
			bottomBar: !!gameStateStore.get('quizWords').length ? 'result' : '',
			popupVisible: false,
			infoBarVisible: false
		});
		log({
			message: 'game finished',
			correctWords: gameStateStore.get('correct'),
			totalWords: gameStateStore.get('correct') + gameStateStore.get('wrong'),
			level: userProfileStore.get('level'),
			score: userProfileStore.get('score')
		});
	},

	handleSingleWordGameFinish: function () {
		this.setState({
			bottomBar: 'wordscount',
			popupVisible: false,
			infoBarVisible: false,
			wordsCountVisible: false
		});
		this.refs[BROWSER_REF].ignoreWord(gameStateStore.get('currentWord').text);
		this.refs[BROWSER_REF].restoreScroll();
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
		console.log('PROFILE LANG', profileLang);
		console.log('onUserProfileChanged, url:', this.state.url);

		log({
			message: 'onUserProfileChanged',
			lang: profileLang
		});

		if (!profileLang) {
			this.setState({
				introScreenVisible: true
			});
			// let react-native render everything and then proceed with animation
			setTimeout(function () {
				this.setState({
					loadingCoverVisible: false
				});
			}.bind(this), 400);
			return;
		}

		if (profileLang !== this.lang) {
			this.lang = profileLang;
			this.resetGame();
			this.reloadBrowser();
		}

		this.setState({
			introScreenVisible: false,
			loadingCoverVisible: false,
			testYourselfPromptShown: userProfileStore.get('testYourselfPromptShown')
		});
	},

	resetGame: function () {
		this.refs[BROWSER_REF].unhighlightWords();

		clearTimeout(this.showSearchingTimeout);

		this.setState({
			question: [],
			bottomBar: ''
		});
		gameStateStore.set('currentState', GAME_STATES.WORDS_FOUND);
	},

	resetViews: function () {
		this.setState({
			url: this.state.url,
			popupVisible: false,
			question: [],
			settingsViewVisible: false,
			bottomBar: '',
			toastShown: false,
			wordsCountVisible: false,
			gameState: gameStateStore.GAME_STATES.NOT_STARTED,
			buyUrlFeaturePopupVisible: false,
			browseOnToastVisible: false,
			testYourselfPromptVisible: false,
			firstWordReady: false,
			guardianInfoViewVisible: false,
			networkErrorViewVisible: false
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
		marginTop: config.IOS_STATUSBAR_HEIGHT,
		flex: 1
	},

	bottomBarWrap: {

	},

	loadingCover: {
		backgroundColor: 'white',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	}
});


AppRegistry.registerComponent('yarn', () => yarn);
