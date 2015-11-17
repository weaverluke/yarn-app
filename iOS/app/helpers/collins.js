var API_KEY = 'wOaKqhkqXIuKKIIRkVRyAy7jNB5dVDeaNZoIpzIMEmxkK4eiZEQDGTFNG3TnlG18';
var BASE_URL = 'https://api.collinsdictionary.com/api/v1/dictionaries/english-learner/search/first/?format=html&q=';

function getDefinition(word) {

	return fetch(BASE_URL + encodeURIComponent(word), {
		headers: {
			accessKey: API_KEY
		}
	})
		.then(function (response) {
			return response.text();
		})
		.then(function (responseText) {
			var json = JSON.parse(responseText);
			if (json.entryContent) {
				json.entryContent = '<style type="text/css">h1, .pron, audio, .inline, .gramGrp {display:none;}</style>' + json.entryContent;
			}
			return json;
			//return JSON.parse(responseText);
		});

}


module.exports = {
	getDefinition: getDefinition
};
