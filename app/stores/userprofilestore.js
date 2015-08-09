'use strict';

//var eventEmitter = require('events').EventEmitter();
var Events = require('events');
var eventEmitter = new Events.EventEmitter();
var CHANGE_EVENT = 'store:changed';

var React = require('react-native');
var {
	AsyncStorage
} = React;

var data = {
	level: 50,
	score: 0,
	language: 'pl',
	correctAnswers: 0,
	wrongAnswers: 0,
	levelStats: []
};

var PERSISTENCE_KEY = '@yarn:userProfileStore';

init();

function init() {
	for (var i = 0; i < 100; i++) {
		data.levelStats[i] = {
			correct: 0,
			wrong: 0
		};
	}
	loadData();
}

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

function updateLevelStats(level, correct) {
	if (correct) {
		data.levelStats[level].correct++;
		data.correctAnswers++;
		data.score = data.correctAnswers * 10;
	} else {
		data.levelStats[level].wrong++;
		data.wrongAnswers++;
	}

	saveData();
	emitChange();
}


function saveData() {
	console.log('saving userProfileStore:', data);

	AsyncStorage
		.setItem(PERSISTENCE_KEY, JSON.stringify(data))
		.done();
}

function loadData(key) {
	AsyncStorage
		.getItem(PERSISTENCE_KEY)
		.then(function (stats) {
			var parsedData = JSON.parse(stats);
			if (parsedData) {
				data = parsedData;
			}
			emitChange();
		})
		.done();
}

module.exports = {
	addChangeListener: addChangeListener,
	get: get,
	set: set,
	updateLevelStats: updateLevelStats
};
