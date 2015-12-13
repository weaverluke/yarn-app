var API_KEY = 'AIzaSyDAjHprVDfX_6z2fAs6Vf03g2sOfEiTogs';
var BASE_URL = 'https://www.googleapis.com/language/translate/v2?key=' + API_KEY;
var NetworkStatus = require('../helpers/networkstatus');
var log = require('../logger/logger');

var React = require('react-native');
var {
	NetInfo
} = React;

var i = 0;

function translateWords(words, fromLang, toLang, callback) {
	if (!Array.isArray(words)) {
		words = [words];
	}

	if (!NetworkStatus.isOk()) {
		return new Promise(function (res, rej) { rej(); });
	}


	return new Promise(function (resolve, reject) {

		NetInfo.isConnected.fetch().done(function (isConnected) {
			if (!isConnected) {
				return reject();
			}

			var url = createUrl(words, fromLang, toLang);
			// 10s for request to be back
			var requestTimeout = setTimeout(function () {
				console.log('google translate request timeout');
				log({
					message: 'Google Translate api request timeout',
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
					resolve(resp);
				})
				.catch(function (err) {
					console.log('Request to google translate api failed!');
					log({
						message: 'Request to Google Translate api failed',
						url: url,
						error: err && err.message
					});
					reject();
				});
		}, function () {
			reject();
		});
	});


	////return new Promise();
	//return fetch(createUrl(words, fromLang, toLang))
	//	.then(function (response) {
	//		return response.text();
	//	})
	//	.then(function (responseText) {
	//		return JSON.parse(responseText);
	//	})
	//	.catch(function () {
	//		console.log('Request to google translate api failed!');
	//	});
}

function createUrl(words, fromLang, toLang) {
	return BASE_URL +
		'&source=' + fromLang +
		'&target=' + toLang +
		// google translate API supports multiple 'q' parameters, each with separate text to translate
		words.reduce(function (prev, current) {
			return prev + '&q=' + current;
		}, '');
}

module.exports = {
	translateWords: translateWords
};
