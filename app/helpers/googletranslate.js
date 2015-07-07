var API_KEY = 'AIzaSyDAjHprVDfX_6z2fAs6Vf03g2sOfEiTogs';
var BASE_URL = 'https://www.googleapis.com/language/translate/v2?key=' + API_KEY;

function translateWords(words, fromLang, toLang, callback) {
	if (!Array.isArray(words)) {
		words = [words];
	}

	return fetch(createUrl(words, fromLang, toLang))
		.then(function (response) {
			return response.text();
		})
		.then(function (responseText) {
			return JSON.parse(responseText);
		});
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
