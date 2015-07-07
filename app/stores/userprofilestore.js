'use strict';

//var eventEmitter = require('events').EventEmitter();
var Events = require('events');
var eventEmitter = new Events.EventEmitter();
var CHANGE_EVENT = 'store:changed';

var data = {
	vocabLevel: 50,
	language: 'pl'
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