'use strict';
var API_KEY = '0a7ad490-b65c-4c58-9600-3bc019f5173c';
var BASE_URL = 'http://content.guardianapis.com/search?pageSize=3&show-most-viewed=true&api-key=' + API_KEY;
var NetworkStatus = require('../helpers/networkstatus');
var log = require('../logger/logger');

var PERSISTENCE_KEY = '@yarn:usedGuardianUrls';
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
	get: function (query, page) {

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
				if (page) {
					url += '&page=' + page;
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

	getUniqueMostViewed: function (lang, page) {
		console.log('Guardian.getUniqueMostViewed(%s, %s)', lang, page);
		page || (page = 0);

		return new Promise(function (resolve, reject) {
			// language results for 30% of queries
			var query = '';
			if (lang && Math.random() <= 0.3) {
				query = lang;
			}

			module.exports.get(query, page)
				.then(function (urls) {
					urls = filterOutAlreadyViewed(urls);
					if (urls.length) {
						addAlreadyVisited(urls[0]);
						resolve(urls[0]);
					}
					else {
						// if no results after filtering then get next page
						module.exports.getUniqueMostViewed(lang, page+1)
							.then(function (result) {
								resolve(result);
							}, function () {
								reject();
							})
							.catch(function () {
								reject();
							});
					}
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