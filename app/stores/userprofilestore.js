'use strict';

var Events = require('events');
var eventEmitter = new Events.EventEmitter();
var CHANGE_EVENT = 'store:changed';
var log = require('../logger/logger');

var React = require('react-native');
var {
	AsyncStorage
} = React;

var INITIAL_LEVEL = 50;

var data = {
	dataVersion: 2,
	language: 'pl',
	testYourselfPromptShown: false,

	introScreenShown: false,
	buyVocabLevelShown: false,
	buyVocabLevelPressed: false,

	wordsLimit: 10,
	level: INITIAL_LEVEL,
	range: 40,
	score: 0,
	correctAnswers: 0,
	wrongAnswers: 0,
	levelStats: [],
	previousScore: 0,
	historyLevelValues: [INITIAL_LEVEL]
};

var PERSISTENCE_KEY = '@yarn:userProfileStore';

init();

function init() {
	initLevelStats();
	// reset :D
	saveData();

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

function set(key, value) {
	data[key] = value;
	emitChange();
	saveData();
}

function get(key) {
	return data[key];
}

function getLangData(key) {
	if (typeof key === 'undefined') {
		return data.quiz && data.quiz[data.language];
	}
	return data.quiz[data.language][key];
}

function setLangData(key, value) {
	getLangData()[key] = value;
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

	saveData();
	emitChange();
}

function saveData() {
	console.log('saving userProfileStore:', data);

	AsyncStorage
		.setItem(PERSISTENCE_KEY, JSON.stringify(data))
		.done();
}

function loadData() {
	AsyncStorage
		.getItem(PERSISTENCE_KEY)
		.then(function (stats) {
			var parsedData = JSON.parse(stats);

			// if this is current version of data structure then load it
			if (parsedData) {
				data = parsedData;
				console.log('parsed data', parsedData);
			}

			migrate1();
			migrate2();
			migrate3();
			// disabled until we disabled separate stats for each language
			//migrate4();
			migrate5();
			console.log('data after migration:', data);

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
	var langData = getLangData();

	if (level === langData.level) {
		return;
	}

	log({
		message: 'Setting user level',
		level: level
	});
	langData.correctAnswers = 0;
	langData.wrongAnswers = 0;
	langData.level = level;
	langData.range = 40;
	langData.levelStats = [];
	langData.historyLevelValues = [];

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

function migrate3() {
	if (!data.previousScore) {
		data.previousScore = 0;
	}
}

// change database structure - store results for each language
function migrate4() {
	// migration already done
	if (!('level' in data)) {
		return;
	}

	var propsToRewrite = [
		'wordsLimit',
		'level',
		'range',
		'score',
		'correctAnswers',
		'wrongAnswers',
		'previousScore',
		'historyLevelValues',
		'levelStats'
	];
	data.quiz = {};

	var langData = data.quiz[data.language] = {};

	for (var i = 0; i < propsToRewrite.length; i++) {
		langData[propsToRewrite[i]] = data[propsToRewrite[i]];
		delete data[propsToRewrite[i]];
	}

	saveData();
}

function migrate5() {
	if (!('buyVocabLevelShown' in data)) {
		data.buyVocabLevelShown = false;
	}
	if (!('buyVocabLevelPressed' in data)) {
		data.buyVocabLevelPressed = false;
	}
}

module.exports = {
	addChangeListener: addChangeListener,
	get: get,
	set: set,
	updateLevelStats: updateLevelStats,
	updateUserLevel: updateUserLevel,
	setUserLevel: setUserLevel
};

