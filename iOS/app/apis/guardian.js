'use strict';
var API_KEY = '0a7ad490-b65c-4c58-9600-3bc019f5173c';
var BASE_URL = 'http://content.guardianapis.com/search?pageSize=15&show-most-viewed=true&api-key=' + API_KEY;
var NetworkStatus = require('../helpers/networkstatus');
var log = require('../logger/logger');

var PERSISTENCE_KEY = '@yarn:usedGuardianUrls';
var DEFAULT_WHEN_ERROR = 'http://www.theguardian.com/uk-news';
var DAY_IN_MS = 24 * 60 * 60 * 1000;

var React = require('react-native');
var {
	NetInfo,
	AsyncStorage
} = React;

var alreadyVisited = [];
// to reset :)
//saveData();
loadData();

function saveData() {

	// remove entries older than 1 week to save the storage
	var now = Date.now();
	alreadyVisited = alreadyVisited.filter(function (entry) {
		return now - entry[1] < 7 * DAY_IN_MS;
	});

	console.log('saving used guardian urls:', alreadyVisited);

	AsyncStorage
		.setItem(PERSISTENCE_KEY, JSON.stringify(alreadyVisited))
		.done();
}

function loadData() {
	AsyncStorage
		.getItem(PERSISTENCE_KEY)
		.then(function (jsonString) {
			try {
				alreadyVisited = JSON.parse(jsonString) || [];
			} catch (ex) {
				log({
					message: 'Cannot parse already visited pages',
					content: jsonString
				});
				alreadyVisited = [];
			}
		})
		.catch(function () {
			alreadyVisited = [];
		})
		.done();
}

function addAlreadyVisited(url) {
	alreadyVisited.push([url, Date.now()]);
	saveData();
}

module.exports = {
	get: function (query) {

		if (!NetworkStatus.isOk()) {
			return new Promise(function (res, rej) { rej(); });
		}

		return new Promise(function (resolve, reject) {
			NetInfo.isConnected.fetch().done(function (isConnected) {
				if (!isConnected) {
					return reject();
				}

				var url = BASE_URL;
				if (query) {
					url += '&q=' + query;
				}

				var requestTimeout = setTimeout(function () {
					log({
						message: 'The Guardian api request timeout',
						url: url
					});
					reject();
				}, 10000);

				fetch(url)
				.then(function (response) {
					clearTimeout(requestTimeout);
					return response.text();
				})
				.then(function (responseText) {
					var resp = JSON.parse(responseText);
					var urls = extractUrls(resp && resp.response);
					if (urls) {
						resolve(urls);
					} else {
						log({
							message: 'Cannot extract urls from The Guardian api response',
							response: responseText
						});
						reject();
					}
				})
				.catch(function (err) {
					log({
						message: 'Request to The Guardian api failed',
						url : url,
						error: err && err.message
					});
					reject();
				});
			}, function () {
				reject();
			});
		});

	},

	getUniqueForLanguage: function (lang) {
		return new Promise(function (resolve, reject) {
			var loaded = 0;
			var result = {
				mostViewed: [],
				forLanguage: []
			};

			function onLoaded() {
				loaded++;
				if (loaded === 2) {
					var url = DEFAULT_WHEN_ERROR;
					if (result.mostViewed.length + result.forLanguage.length) {
						if (result.forLanguage.length) {
							url = result.forLanguage.shift();
						} else {
							url = result.mostViewed.shift();
						}
						addAlreadyVisited(url);
					}
					else {
						log({
							message: 'No links from The Guardian api'
						});
					}
					resolve(url);
				}
			}

			module.exports.get()
				.then(function (urls) {
					result.mostViewed = filterOutAlreadyViewed(urls);
					onLoaded();
				}, function () {
					onLoaded();
				}).catch(function () {
					onLoaded();
			});

			module.exports.get(lang)
					.then(function (urls) {
						result.forLanguage = filterOutAlreadyViewed(urls);
						onLoaded();
					}, function () {
						onLoaded();
					}).catch(function () {
				onLoaded();
			});
		});
	},

	getUniqueMostViewed: function () {
		return new Promise(function (resolve, reject) {
			module.exports.get()
				.then(function (urls) {
					urls = filterOutAlreadyViewed(urls);
					var url = DEFAULT_WHEN_ERROR;
					if (urls.length) {
						url = urls[0];
						addAlreadyVisited(url);
					}
					resolve(url);
				}, function () {
					reject();
				}).catch(function () {
					reject();
			});
		});
	}


};

function extractUrls(response) {
	var urls = [];
	if (response && response.status === 'ok' && response.results && response.results.length) {
		urls = response.results.map(function (entry) {
			return entry.webUrl;
		});
		return urls;
	}
}

function filterOutAlreadyViewed(urls) {
	urls = urls.filter(function (url) {
		// all already used are different from current one?
		return alreadyVisited.every(function (visitedUrl) {
			// visited url has array structure: [url, timestampWhenViewed]
			return visitedUrl[0] !== url;
		});
	});
	return urls;
}