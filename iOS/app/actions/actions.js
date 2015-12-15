var Events = require('events');
var bus = new Events.EventEmitter();
var actions = require('./actiontypes');

var getRandomWords = require('../helpers/getrandomwords');
var googleTranslate = require('../apis/googletranslate');
var collins = require('../apis/collins');
var log = require('../logger/logger');

var gameStateStore = require('../stores/gamestatestore');
var userProfileStore = require('../stores/userprofilestore');

var words = require('../../../Languages/en/en.js');

var React = require('react-native');
var {
	AsyncStorage
} = React;

//var {
//	DictionaryProxy
//} = require('NativeModules');

var GAME_STATES = gameStateStore.GAME_STATES;

var CHECK_DICT_DEFINITIONS = false;

function copy(obj) {
	return JSON.parse(JSON.stringify(obj));
}

Object.keys(actions).forEach(function (action) {
	bus[action] = actions[action];
});

var preloadedWords = {};

bus.on(actions.WORDS_PARSED, onWordsParsed);
bus.on(actions.VISITED_WORDS_CHANGED, onVisitedWordsChanged);
bus.on(actions.START_GAME, onStartGame);
bus.on(actions.SHOW_NEXT_QUESTION, onShowNextQuestion);
bus.on(actions.WORD_PRESSED, onWordPressed);
bus.on(actions.CHANGE_LANG, onChangeLang);
bus.on(actions.RESET, onReset);
bus.on(actions.CHANGE_LEVEL, onChangeLevel);
bus.on(actions.LOOKING_FOR_WORDS, onLookingForWords);
bus.on(actions.HOME_BUTTON_PRESSED, onHomePressed);
bus.on(actions.WORD_IN_BROWSER_PRESSED, onWordInBrowserPressed);

function onWordsParsed(words) {
	if (!words.length) {
		gameStateStore.set('currentState', GAME_STATES.NOT_STARTED);
		return;
	}

	gameStateStore.pause(true);
	gameStateStore.reset(true);
	words = spreadWords(words, userProfileStore.get('wordsLimit'));
	gameStateStore.set('pageWords', words);
	gameStateStore.set('currentState', gameStateStore.GAME_STATES.WORDS_FOUND);
	gameStateStore.pause(false);
	log({
		message: 'words prepared',
		words: words,
		userLevel: userProfileStore.get('level'),
		wordsRange: userProfileStore.get('range'),
		userScore: userProfileStore.get('score')
	});
	bus.emit(actions.WORDS_READY, words);
}

function spreadWords(words, limit) {
	var skip = Math.max(~~(words.length / limit), 1);
	var newWords = [];
	var i = 0;
	while (newWords.length < limit && words[i]) {
		newWords.push(words[i]);
		i+= skip;
	}
	return newWords;
}

function onVisitedWordsChanged(words) {
	gameStateStore.set('visitedPageWords', words);
	preloadWords();
}

function onStartGame(word) {
	gameStateStore.pause(true);
	gameStateStore.set('finished', false);
	gameStateStore.set('currentWordIndex', -1);

	if (typeof word === 'string') {
		gameStateStore.set('quizWords', [word]);
		gameStateStore.set('singleWordMode', true);
	}
	else {
		gameStateStore.set('singleWordMode', false);
		gameStateStore.set('quizWords', gameStateStore.get('visitedPageWords'));
		log({
			message: 'start game',
			visitedWords: gameStateStore.get('visitedPageWords')
		});
	}
	gameStateStore.pause(false);

	// save previousScore only when starting new game
	if (gameStateStore.get('correct') + gameStateStore.get('wrong') === 0) {
		userProfileStore.set('previousScore', userProfileStore.get('score'));
	}

	bus.emit(actions.SHOW_NEXT_QUESTION);
	log({
		message: 'start game',
		singleMode: word,
		visitedWords: gameStateStore.get('visitedPageWords')
	});
}

function preloadWords() {
	var visited = gameStateStore.get('visitedPageWords');
	for (var i = 0; i < visited.length; i++) {
		if (!preloadedWords[visited[i]])	{
			preloadedWords[visited[i]] = preloadWord(visited[i]);
		}
	}

	// notify about first preloaded word
	if (visited.length && preloadedWords[visited[0]]) {
		preloadedWords[visited[0]].then(function () {
			gameStateStore.set('firstWordReady', true);
		});
	}
}

function preloadWord(pageWord) {
	var wordsToTranslate = getRandomWords(gameStateStore.get('randomWordsCount'));
	wordsToTranslate.unshift(pageWord);

	console.log('preloading word', pageWord, wordsToTranslate);

	var promise = new Promise(function (resolve, reject) {

		// delay fetching by random amount of time so yarn doesn't trigger too many requests at once
		setTimeout(function () {

			var startDate = Date.now();
			googleTranslate.translateWords(wordsToTranslate, 'en', userProfileStore.get('language'))
				.then(function (translatedWords) {
					if (translatedWords.error) {
						log({
							message: 'Translation error',
							error: translatedWords.error
						});
						return reject();
					}
					console.log('translations loaded', pageWord, Date.now() - startDate,
							translatedWords.data.translations.length, translatedWords.data.translations);

					//console.log('translated words', translatedWords);
					var question = translatedWords.data.translations.map(function (translatedWord, index) {
						return {
							text: wordsToTranslate[index],
							definition: translatedWord.translatedText
						};
					});

					question[0].target = true;

					if (CHECK_DICT_DEFINITIONS) {
						// check if there are definitions in native dictionary
						//var checkedWords = 0;
						//question.forEach(function (word, index) {
						//	var start = Date.now();
						//	console.log('check dict definition', word)
						//	DictionaryProxy.dictionaryHasDefinitionForTerm(index === 0 ? word.text : word.definition,
						//		function (resp) {
						//			console.log('check dict definition, end', word, Date.now() - start);
						//			word.hasDictionaryDefinition = resp;
						//			if (++checkedWords === question.length) {
						//				console.log('word preloaded', pageWord, Date.now(), question);
						//				resolve(question);
						//			}
						//		});
						//});
					} else {
						question.forEach(function (word) {
							word.hasDictionaryDefinition = true;
						});
						resolve(question);
					}
				}, function () {
					bus.emit(actions.NETWORK_ERROR_OCCURRED);
					reject();
				})
				.catch(function (ex) {
					console.log('Cannot translate words:', ex);
					bus.emit(actions.NETWORK_ERROR_OCCURRED);
					reject();
				});

		}, Math.random() * 400 + 100);

	});

	return promise;
}

function onShowNextQuestion() {
	if (
		gameStateStore.get('singleWordMode') &&
		(gameStateStore.get('currentState') === GAME_STATES.CORRECT_ANSWER_CHOSEN ||
		gameStateStore.get('currentState') === GAME_STATES.WRONG_ANSWER_CHOSEN) &&
		gameStateStore.get('pageWords').length !== gameStateStore.get('correct') + gameStateStore.get('wrong')
	) {
		gameStateStore.pause(true);
		gameStateStore.set('finished', true);
		gameStateStore.set('currentState', GAME_STATES.WORDS_FOUND);
		gameStateStore.pause(false);
		return;
	}

	var currentWordIndex = gameStateStore.get('currentWordIndex') + 1;

	if (currentWordIndex === gameStateStore.get('quizWords').length) {
		gameStateStore.set('finished', true);
		return
	}

	var currentWord = gameStateStore.get('quizWords')[currentWordIndex];



	preloadedWords[currentWord].then(function (question) {
		question = copy(question);
		gameStateStore.pause(true);
		gameStateStore.set('currentWord', question[0]);

		// shuffle words
		question.sort(function () { return Math.random() < 0.5 ? 1 : -1 });

		// round by random amount
		var round = Math.floor(Math.random() * question.length);
		var start = question.splice(0, round);
		question = question.concat(start);

		gameStateStore.set('currentQuestion', question);
		gameStateStore.set('currentWordIndex', currentWordIndex);
		gameStateStore.set('currentState', GAME_STATES.WAITING_FOR_ANSWER);
		gameStateStore.pause(false);
	});

}

function onWordPressed(word) {
	// proceed only if we're waiting for answer
	if (gameStateStore.get('currentState') !== GAME_STATES.WAITING_FOR_ANSWER) {
		return;
	}

	gameStateStore.pause(true);

	var levelOfCurrentWord = words[gameStateStore.get('currentWord').text];

	gameStateStore.set('chosenAnswer', word);
	if (word === gameStateStore.get('currentWord').definition) {
		gameStateStore.set('correct', gameStateStore.get('correct') + 1);
		gameStateStore.set('currentState', GAME_STATES.CORRECT_ANSWER_CHOSEN);
		userProfileStore.updateLevelStats(levelOfCurrentWord, true);
		console.log('correct + 1', gameStateStore.get('correct'));
	}
	else {
		console.log('wrong + 1');
		gameStateStore.set('wrong', gameStateStore.get('wrong') + 1);
		gameStateStore.set('currentState', GAME_STATES.WRONG_ANSWER_CHOSEN);
		userProfileStore.updateLevelStats(levelOfCurrentWord, false);
		console.log('wrong + 1', gameStateStore.get('wrong'));
	}

	var lastWordInSingleModePressed =
			gameStateStore.get('pageWords').length === (gameStateStore.get('correct') + gameStateStore.get('wrong'));

	if (
		(!gameStateStore.get('singleWordMode') || lastWordInSingleModePressed) &&
		(gameStateStore.get('currentWordIndex') === gameStateStore.get('quizWords').length - 1)
	) {
		userProfileStore.updateUserLevel();
	}

	var question = gameStateStore.get('currentQuestion');
	// mark selected word
	question.forEach(function (wordDef) {
		if (wordDef.definition === word) {
			wordDef.chosen = true;
		}
	});

	gameStateStore.pause(false);
}

function onChangeLang(lang) {
	if (lang === userProfileStore.get('language')) {
		return;
	}

	userProfileStore.set('language', lang);
	bus.emit(actions.RESET);
}

function onChangeLevel(level) {
	if (level === userProfileStore.get('language')) {
		return;
	}
	userProfileStore.setUserLevel(level);
	bus.emit(actions.RESET);
}

function onReset() {
	console.log('game reset');
	preloadedWords = {};
	gameStateStore.reset();
}

function onLookingForWords() {
	console.log('-------> ', 'looking for words');
	gameStateStore.set('currentState', GAME_STATES.LOOKING_FOR_WORDS);
}

function onHomePressed() {
	onReset();
}

function onWordInBrowserPressed(word) {
	onStartGame(word);
}

module.exports = bus;

