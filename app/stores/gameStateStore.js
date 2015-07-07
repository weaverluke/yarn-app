'use strict';

//var eventEmitter = new require('events').EventEmitter();
var Events = require('events');
var eventEmitter = new Events.EventEmitter();
var CHANGE_EVENT = 'store:changed';

var initialData = {
	pageWords: [],
	currentWordIndex: -1,
	currentWord: '',
	currentQuestion: null,
	randomWordsCount: 5
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
	pause: pause
};
