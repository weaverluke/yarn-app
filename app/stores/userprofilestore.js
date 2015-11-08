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
var MAX_LEVEL = 60;

var initialLanguageStats = {
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

var data = {
	language: 'pl',
	testYourselfPromptShown: false,
	introScreenShown: false,

	quiz: {
		pl: JSON.parse(JSON.stringify(initialLanguageStats))
	}
};

// old data stats
//var data = {
//	wordsLimit: 10,
//	level: 55,
//	range: 10,
//	score: 350,
//	language: 'pl',
//	correctAnswers: 0,
//	wrongAnswers: 0,
//	levelStats: [],
//	previousScore: 0,
//	testYourselfPromptShown: false,
//	introScreenShown: false,
//	historyLevelValues: []
//};

var PERSISTENCE_KEY = '@yarn:userProfileStore';

init();

function init() {
	initLevelStats();
	// reset :D
	//saveData();

	loadData();
}

function initLevelStats() {
	var landData = getLangData();

	for (var i = 0; i < 100; i++) {
		landData.levelStats[i] = {
			correct: 0,
			wrong: 0
		};
	}
}

function set(key, d) {
	var changed = false;

	// try to set on top level
	if (data.hasOwnProperty(key)) {
		data[key] = d;
		changed = true;
	}

	// if top level has no such key then try to change current language
	else if (getLangData().hasOwnProperty(key)) {
		setLangData()[key] = d;
		changed = true;
	}

	if (changed) {
		emitChange();
		saveData();
	}
}

function get(key) {
	// try to return top level value
	if (data.hasOwnProperty(key)) {
		return data[key];
	}

	// check if current language has such property, if so then return it
	if (getLangData().hasOwnProperty(key)) {
		return getLangData(key);
	}
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
	var langData = getLangData();

	if (!langData.levelStats[level]) {
		langData.levelStats[level] = {
			correct: 0,
			wrong: 0
		};
	}

	if (correct) {
		langData.levelStats[level].correct++;
		langData.correctAnswers++;
		langData.score = langData.correctAnswers * 10;
	} else {
		langData.levelStats[level].wrong++;
		langData.wrongAnswers++;
	}

	saveData();
	emitChange();
}

function updateUserLevel() {
	var langData = getLangData();
	var totalAnswers = langData.correctAnswers + langData.wrongAnswers;
	// we have to have at least 20 words to compute level
	if (totalAnswers < 20) {
		console.log('Cannot compute user level yet');
		return;
	}

	var sum = 0;
	var max = 0;

	for (var i = 0, len = langData.levelStats.length; i < len; i++) {
		// level must have any entries to be included into computations
		var lvl = langData.levelStats[i];
		var weight = (100 - i) * 0.9;

		if (lvl.correct || lvl.wrong) {
			sum += (i + 1) * lvl.correct / (lvl.correct + lvl.wrong) * weight;
			max += (i + 1) * weight;
		}
	}

	var newLevel = parseInt(sum / max * 100);
	newLevel = Math.min(MAX_LEVEL, newLevel);

	langData.level = newLevel;
	console.log('New user level:', langData.level);

	// range update - after first 50 words shrink range to 30
	if (totalAnswers > 20 && langData.range == 40) {
		langData.range = 30;
	}
	else if (totalAnswers > 40 && langData.range == 30) {
		langData.range = 20;
	}
	else if (totalAnswers > 60 && langData.range == 20) {
		langData.range = 15;
	}

	langData.historyLevelValues.push(langData.level);

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
			if (parsedData) {
				data = parsedData;
				console.log('parsed data', parsedData);
			}

			migrate1();
			migrate2();
			migrate3();
			migrate4();
			console.log('data aafter migration:', data);

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
	if (!('wordsLimit' in data)) {
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
}

module.exports = {
	addChangeListener: addChangeListener,
	get: get,
	set: set,
	updateLevelStats: updateLevelStats,
	updateUserLevel: updateUserLevel,
	setUserLevel: setUserLevel
};

