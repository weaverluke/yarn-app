'use strict';

var Events = require('events');
var eventEmitter = new Events.EventEmitter();
var CHANGE_EVENT = 'store:changed';
var log = require('../logger/logger');

var React = require('react-native');
var {
	AsyncStorage
} = React;

var data = {
	wordsLimit: 10,
	level: 0,
	range: 40,
	score: 0,
	language: 'pl',
	correctAnswers: 0,
	wrongAnswers: 0,
	levelStats: [],
	historyLevelValues: []
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
	// reset :D
	//saveData();

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

	updateUserLevel();
	saveData();
	emitChange();
}

function updateUserLevel() {
	var totalAnswers = data.correctAnswers + data.wrongAnswers;
	// we have to have at least 20 words to compute level
	if (totalAnswers < 20) {
		console.log('Cannot compute user level yet');
		return;
	}

	var sum = 0;
	var max = 0;

	for (var i = 0, len = data.levelStats.length; i < len; i++) {
		// level must have any entries to be included into computations
		var lvl = data.levelStats[i];
		if (lvl.correct || lvl.wrong) {
			sum += (i + 1) * lvl.correct / (lvl.correct + lvl.wrong) * 100;
			max += (i + 1) * 100;
		}
	}

	data.level = parseInt(sum / max * 100);
	console.log('New user level:', data.level);

	// range update - after first 50 words shrink range to 30
	if (totalAnswers > 40 && data.range == 40) {
		data.range = 30;
	}
	else if (totalAnswers > 80 && data.range == 30) {
		data.range = 20;
	}
	else if (totalAnswers > 120 && data.range == 20) {
		data.range = 10;
	}

	data.historyLevelValues.push(data.level);
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
			migrate1();

			log({
				message: 'user profile loaded',
				userProfileData: data
			});

			emitChange();
		})
		.done();
}

function migrate1() {
	if (!data.wordsLimit) {
		data.wordsLimit = 10;
		saveData();
	}
}

module.exports = {
	addChangeListener: addChangeListener,
	get: get,
	set: set,
	updateLevelStats: updateLevelStats
};
