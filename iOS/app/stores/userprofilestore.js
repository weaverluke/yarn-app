

var Events = require('events');
var eventEmitter = new Events.EventEmitter();
var CHANGE_EVENT = 'store:changed';
var log = require('../logger/logger');
var config = require('../config');

var React = require('react-native');
var {
	AsyncStorage
} = React;

var INITIAL_LEVEL = 30;

var data = {
	dataVersion: 3,
	loaded: false, // changed when loaded is loaded from device
	premiumVocabLevel: false,

	language: '',
	testYourselfPromptShown: false,

	buyVocabLevelShown: false,
	buyVocabLevelPressed: false,

	wordsLimit: 10,
	level: INITIAL_LEVEL,
	range: 25,
	score: 0,
	correctAnswers: 0,
	wrongAnswers: 0,
	levelStats: [],
	previousScore: 0,
	historyLevelValues: [INITIAL_LEVEL],
	selectedCategories: {}
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
	//console.log('updateUserLevel(), currentStats:', data);
	var totalAnswers = data.correctAnswers + data.wrongAnswers;
	// we have to have at least 20 words to compute level
	if (totalAnswers < 8) {
		console.log('Cannot compute user level yet');
		return;
	}

	var sum = 0;
	var max = 0;
	var maxLevel = 0;

	for (var i = 0, len = data.levelStats.length; i < len; i++) {
		// level must have any entries to be included into computations
		var lvl = data.levelStats[i];
		var weight = 1; // tmp instead of  (100 - i) * 0.9;
		var lvlResult = 0;

		if (lvl.correct || lvl.wrong) {
			//console.log('lvl', i +1, 'correct', lvl.correct, 'wrong', lvl.wrong);
			lvlResult = lvl.correct / (lvl.correct + lvl.wrong);
			sum += (i + 1) * lvlResult * weight;
			maxLevel = Math.max(maxLevel, i*lvlResult);
			// increment max only if there are any positive results
			lvl.correct && (max += (i + 1) * weight);
			//console.log('sum', sum, 'maxLevel', maxLevel, 'max', max);
		}
	}

	data.level = parseInt(sum / max * maxLevel);
	console.log('New user level:', data.level);

	// range update - after first 50 words shrink range to 30
	if (totalAnswers > 10 && data.range == 25) { // previously 20, 40 and 30
		data.range = 20;
	}
	else if (totalAnswers > 20 && data.range == 20) { // previously 40, 30 and 20
		data.range = 18;
	}
	else if (totalAnswers > 30 && data.range == 18) { // previously 60, 20 and 15
		data.range = 15;
	}

	data.historyLevelValues.push(data.level);
	//console.log('new user level:', data.level);

	saveData();
	emitChange();
}

function saveData() {
	//console.log('saving userProfileStore:', data);

	AsyncStorage
		.setItem(PERSISTENCE_KEY, JSON.stringify(data))
		.done();
}

function loadData() {
	AsyncStorage
		.getItem(PERSISTENCE_KEY)
		.then(function (stats) {
			var parsedData;

			try {
				parsedData = JSON.parse(stats);
			} catch (ex) {
				emitChange();
				saveData();
				return;
			}

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
			migrate6();

			data.loaded = true;
			console.log('data after migration:', data);

			log({
				message: 'user profile loaded',
				userProfileData: data
			});

			if (data.premiumVocabLevel) {
				config.MAX_VOCAB_LEVEL = 101;
			}

			emitChange();
		})
		.catch(function () {
			emitChange();
			saveData();
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

function migrate6() {
	if (!('selectedCategories' in data)) {
		data.selectedCategories = {};
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

