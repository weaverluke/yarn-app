'use strict';

//var eventEmitter = new require('events').EventEmitter();
var Events = require('events');
var eventEmitter = new Events.EventEmitter();
var CHANGE_EVENT = 'store:changed';

var GAME_STATES = {
	WAITING_FOR_ANSWER: 'WAITING_FOR_ANSWER',
	WRONG_ANSWER_CHOSEN: 'ANSWER_CHOSEN',
	CORRECT_ANSWER_CHOSEN: 'WRONG_ANSWER_CHOSEN'
};

var initialData = {
	pageWords: [],
	currentWordIndex: -1,
	currentWord: '',
	currentQuestion: null,
	chosenAnswer: '',
	randomWordsCount: 4,
	currentState: '',
	correct: 0,
	wrong: 0,
	finished: false
};

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
