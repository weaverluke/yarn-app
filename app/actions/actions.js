//var bus = require('events').EventEmitter();
var Events = require('events');
var bus = new Events.EventEmitter();
var actions = require('./actiontypes');

var getRandomWords = require('../helpers/getrandomwords');
var googleTranslate = require('../helpers/googletranslate');
var collins = require('../helpers/collins');

var gameStateStore = require('../stores/gamestatestore');
var userProfileStore = require('../stores/userprofilestore');

var words = require('../../words');

var React = require('react-native');
var {
	AsyncStorage
} = React;

var GAME_STATES = gameStateStore.GAME_STATES;

Object.keys(actions).forEach(function (action) {
	bus[action] = actions[action];
});


bus.on(actions.WORDS_PARSED, onWordsParsed);
bus.on(actions.SHOW_NEXT_QUESTION, onShowNextQuestion);
bus.on(actions.WORD_PRESSED, onWordPressed);
bus.on(actions.CHANGE_LANG, onChangeLang);

function onWordsParsed(words) {
	if (!words.length) {
		return;
	}

	gameStateStore.pause(true);
	gameStateStore.reset(true);
	words = spreadWords(words, userProfileStore.get('wordsLimit'));
	gameStateStore.set('pageWords', words);
	gameStateStore.pause(false);
	bus.emit(actions.SHOW_NEXT_QUESTION);
}

function spreadWords(words, limit) {
	var skip = ~~(words.length / limit);
	var newWords = [];
	var i = 0;
	var len = words.length - skip;
	for (i = 0; i < len; i += skip) {
		newWords.push(words[i]);
	}
	return newWords;
}

function onShowNextQuestion() {
	var currentWordIndex = gameStateStore.get('currentWordIndex') + 1;

	if (currentWordIndex === gameStateStore.get('pageWords').length) {
		gameStateStore.set('finished', true);
		return
	}

	var currentWord = gameStateStore.get('pageWords')[currentWordIndex];
	var wordsToTranslate = getRandomWords(gameStateStore.get('randomWordsCount'));
	wordsToTranslate.unshift(currentWord);

	var definition;
	var question;

	Promise.all([
		collins.getDefinition(currentWord)
			.then(function (resp) {
				//console.log('COLLINS:', resp);
				definition = {
					entryLabel: resp.entryLabel,
					entryContent: resp.entryContent
				}
			})
			.catch(function (ex) {
				// show error screen
				console.error('Can not translate words:', ex);
			}),

		googleTranslate.translateWords(wordsToTranslate, 'en', userProfileStore.get('language'))
			.then(function (translatedWords) {
				//console.log('translated words', translatedWords);
				question = translatedWords.data.translations.map(function (translatedWord, index) {
					return {
						text: wordsToTranslate[index],
						definition: translatedWord.translatedText
					};
				});

				question[0].target = true;
			})
			.catch(function (ex) {
				// show error screen
				console.error('Can not translate words:', ex);
			})

	]).then(function () {
		//console.log('WORDS READY!');

		gameStateStore.pause(true);
		question[0].def = definition;
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
}

module.exports = bus;

