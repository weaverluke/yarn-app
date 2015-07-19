var words = require('../../../words');
var splitGluedTogetherWords = require('./splitGluedTogetherWords');

function getWordsInRange(articleWords, start, stop) {
	var output = [];

	articleWords.forEach(function (w) {
		if (
			// make sure that word has range computed
			w in words && 
			// make sure that word is inside required range
			words[w] >= start && words[w] <= stop && 
			// make sure that word has not yet been added
			output.indexOf(w) === -1
		) {
			output.push(w);
		}
	});

	//console.log('words in desired level: ', output);
	return output;
}

module.exports = {
	extractWordsFromArticle: function (articleText, rangeStart, rangeStop) {
	    var textContent = articleText.replace(/  +/g, ' '); // if there are multiple spaces, replace them into single one
	    //console.log('website text content:', textContent);
	    var extractedWords = splitGluedTogetherWords(textContent);
	    //console.log('parsed words,', extractedWords);

		return getWordsInRange(extractedWords, rangeStart, rangeStop);
	}
};