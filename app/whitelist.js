var regexps = [
	// match four digit year, used for the guardian links but may work on any page
	/.*\/\d{4}\/.*/
];


function doesMatch(url) {
	return regexps.some(function (rx) {
		return rx.test(url);
	});
}

module.exports = {
	regexps: regexps,
	doesMatch: doesMatch
};