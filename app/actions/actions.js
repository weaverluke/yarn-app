//var bus = require('events').EventEmitter();
var Events = require('events');
var bus = new Events.EventEmitter();
var actions = require('./actiontypes');

var getRandomWords = require('../helpers/getrandomwords');
var googleTranslate = require('../helpers/googletranslate');

var gameStateStore = require('../stores/gamestatestore');
var userProfileStore = require('../stores/userprofilestore');

Object.keys(actions).forEach(function (action) {
	bus[action] = actions[action];
});


bus.on(actions.WORDS_PARSED, onWordsParsed);
bus.on(actions.SHOW_NEXT_QUESTION, onShowNextQuestion);

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

	googleTranslate.translateWords(wordsToTranslate, 'en', userProfileStore.get('language'))
		.then(function (translatedWords) {
			console.log('translated words', translatedWords);
			var question = translatedWords.data.translations.map(function (translatedWord, index) {
				return {
					text: wordsToTranslate[index],
					definition: translatedWord.translatedText
				};
			});

			question[0].target = true;
			gameStateStore.pause(true);
			gameStateStore.set('currentQuestion', question);
			gameStateStore.set('currentWord', currentWord);
			gameStateStore.set('currentWordIndex', currentWordIndex);
			gameStateStore.pause(false);
		})
		.catch(function (ex) {
			// show error screen
			console.error('Can not translate words:', ex);
		});
}

module.exports = bus;

