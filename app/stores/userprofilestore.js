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
	testYourselfPromptShown: false,
	historyLevelValues: []
};

var PERSISTENCE_KEY = '@yarn:userProfileStore';

init();

function init() {
	initLevelStats();
	// reset :D
	//saveData();

	loadData();
}

function initLevelStats() {
	for (var i = 0; i < 100; i++) {
		data.levelStats[i] = {
			correct: 0,
			wrong: 0
		};
	}
}

function set(key, d) {
	data[key] = d;
	emitChange();
	saveData();
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
		var weight = (100 - i) * 0.9;

		if (lvl.correct || lvl.wrong) {
			sum += (i + 1) * lvl.correct / (lvl.correct + lvl.wrong) * weight;
			max += (i + 1) * weight;
		}
	}

	data.level = parseInt(sum / max * 100);
	console.log('New user level:', data.level);

	// range update - after first 50 words shrink range to 30
	if (totalAnswers > 20 && data.range == 40) {
		data.range = 30;
	}
	else if (totalAnswers > 40 && data.range == 30) {
		data.range = 20;
	}
	else if (totalAnswers > 60 && data.range == 20) {
		data.range = 15;
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
			migrate2();

			log({
				message: 'user profile loaded',
				userProfileData: data
			});

			emitChange();
		})
		.done();
}

/**
 * This has to reset user stats as we compute level at the end of each quiz so level
 * forced by user would be overwritten by level computation algorithm.
 * @param level
 */
function setUserLevel(level) {
	if (level === data.level) {
		return;
	}

	log({
		message: 'Setting user level',
		level: level
	});
	data.correctAnswers = 0;
	data.wrongAnswers = 0;
	data.level = level;
	data.range = 40;
	data.levelStats = [];
	data.historyLevelValues = [];
	initLevelStats();
	saveData();
	emitChange();
}

function migrate1() {
	if (!data.wordsLimit) {
		data.wordsLimit = 10;
		saveData();
	}
}

function migrate2() {
	if (!('testYourselfPromptShown' in data)) {
		data.testYourselfPromptShown = false;
	}
}

module.exports = {
	addChangeListener: addChangeListener,
	get: get,
	set: set,
	updateLevelStats: updateLevelStats,
	setUserLevel: setUserLevel
};
