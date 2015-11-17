var splitCharacters = ['"', '.', ';', '?', ',', '”', ')', ':', '!', '“', '(', '/', '*'];

module.exports = function(textContent) {
	var words = textContent.split(' ');

	words.forEach(function(word, index) {
		splitCharacters.forEach(function(character) {
			if (word.indexOf(character) !== -1) {
				var split = word.split(character);
				if (split[0] && split[1]) {
					for(var i = 0; i< split.length - 1; i++){
						split[i] = split[i] + character;
					}
					words.splice.apply(words, [index, 1].concat(split));
				}
			}
		});
	});

	words.forEach(function(word, index) {
		// string starts with lowercase and contains uppercase letter
		if (/[a-z]/.test(word.charAt(0)) && /[A-Z]/.test(word)) {
			for (var i = 0; i < word.length; i++) {
				if (/[A-Z]/.test(word.charAt(i))) {
					words.splice(index, 1, word.substring(0, i), word.substring(i, word.length));
					return;
				}
			}
		}
	});

	words = words.filter(function(word) {
		return word !== '';
	});

	return words;
};