//var bus = require('events').EventEmitter();
var Events = require('events');
var bus = new Events.EventEmitter();
var actions = require('./actiontypes');

var getRandomWords = require('../helpers/getrandomwords');
var googleTranslate = require('../helpers/googletranslate');
var collins = require('../helpers/collins');

var gameStateStore = require('../stores/gamestatestore');
var userProfileStore = require('../stores/userprofilestore');

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

	var currentWord = gameStateStore.get('pageWords')[currentWordIndex];
	var wordsToTranslate = getRandomWords(gameStateStore.get('randomWordsCount'));
	wordsToTranslate.unshift(currentWord);

	var definition;
	var question;

	Promise.all([
		collins.getDefinition(currentWord)
			.then(function (resp) {
				console.log('COLLINS:', resp);
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
				console.log('translated words', translatedWords);
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
		console.log('WORDS READY!');

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
		gameStateStore.set('currentState', GAME_STATES.CORRECT_ANSWER_CHOSEN);
	}
	else {
		gameStateStore.set('currentState', GAME_STATES.WRONG_ANSWER_CHOSEN);
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

module.exports = bus;

