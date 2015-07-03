'use strict';

var eventEmitter = require('events').EventEmitter();
var CHANGE_EVENT = 'store:changed';

var data = {
	currentWords: [],
	currentWordIndex: 0
};

function set(key, d) {
	data[key] = d;
	emitChange();
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

module.exports = {
	addChangeListener: addChangeListener,
	get: get,
	set: set
};
