'use strict';

var Events = require('events');
var eventEmitter = new Events.EventEmitter();
var CHANGE_EVENT = 'store:changed';

var GAME_STATES = {
	NOT_STARTED: 'NOT_STARTED',
	LOOKING_FOR_WORDS: 'LOOKING_FOR_WORDS',
	WORDS_FOUND: 'WORDS_FOUND',
	WAITING_FOR_ANSWER: 'WAITING_FOR_ANSWER',
	WRONG_ANSWER_CHOSEN: 'WRONG_ANSWER_CHOSEN',
	CORRECT_ANSWER_CHOSEN: 'CORRECT_ANSWER_CHOSEN'
};

var initialData = {
	pageWords: [],
	visitedPageWords: [],
	currentWordIndex: -1,
	currentWord: '',
	currentQuestion: null,
	chosenAnswer: '',
	randomWordsCount: 6,
	currentState: GAME_STATES.NOT_STARTED,
	correct: 0,
	wrong: 0,
	finished: false,
	firstWordReady: false
}

var data = JSON.parse(JSON.stringify(initialData));
var listenersPaused = false;

function set(key, d) {
	data[key] = d;
	!listenersPaused && emitChange();
}

function get(key) {
	return data[key];
}

function emitChange() {
	eventEmitter.emit(CHANGE_EVENT);
}

function addChangeListener(listener) {
	eventEmitter.on(CHANGE_EVENT, listener);
}

function reset() {
	data = JSON.parse(JSON.stringify(initialData));
	!listenersPaused && emitChange();
}

function pause(b) {
	listenersPaused = b;
	!listenersPaused && emitChange();
}

module.exports = {
	addChangeListener: addChangeListener,
	get: get,
	set: set,
	reset: reset,
	pause: pause,
	GAME_STATES: GAME_STATES
};
