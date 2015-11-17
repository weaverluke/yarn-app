var words = Object.keys(require('../../../Languages/en/en'));

module.exports = function (amount) {
	amount || (amount = 5);
	var results = [];

	while (--amount) {
		var index = Math.round(Math.random() * words.length);
		results.push(words[index]);
	}

	return results;
};