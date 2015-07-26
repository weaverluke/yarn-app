//var bus = require('events').EventEmitter();
var Events = require('events');
var bus = new Events.EventEmitter();
var actions = require('./actiontypes');

var getRandomWords = require('../helpers/getrandomwords');
var googleTranslate = require('../helpers/googletranslate');
var collins = require('../helpers/collins');

var gameStateStore = require('../stores/gamestatestore');
var userProfileStore = require('../stores/userprofilestore');

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

function onWordsParsed(words) {
	gameStateStore.pause(true);
	gameStateStore.reset(true);
	gameStateStore.set('pageWords', words);
	gameStateStore.pause(false);
	bus.emit(actions.SHOW_NEXT_QUESTION);
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
		question.sort(function () { return Math.random() < 0.5; });
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

	gameStateStore.set('chosenAnswer', word);
	if (word === gameStateStore.get('currentWord').definition) {
		gameStateStore.set('correct', gameStateStore.get('correct') + 1);
		gameStateStore.set('currentState', GAME_STATES.CORRECT_ANSWER_CHOSEN);
		updateUserStats(1);
		console.log('correct + 1', gameStateStore.get('correct'));
	}
	else {
		console.log('wrong + 1');
		gameStateStore.set('wrong', gameStateStore.get('wrong') + 1);
		gameStateStore.set('currentState', GAME_STATES.WRONG_ANSWER_CHOSEN);
		updateUserStats(-1);
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

function updateUserStats(value) {
	var key = '@yarn:';
	if (value > 0) {
		key += 'correct';
	} else {
		key += 'wrong'
	}

	value = Math.abs(value);

	AsyncStorage
		.getItem(key)
		.then(incrementValue)
		.done();


	function incrementValue(currentValue) {
		if (currentValue === null) {
			currentValue = 0;
		} else {
			currentValue = parseInt(currentValue, 10);
		}
		currentValue += value;

		console.log('user stats change:', key, currentValue);

		AsyncStorage
			.setItem(key, ''+currentValue)
			.done();
	}
}

module.exports = bus;

