'use strict';

//var url = 'https://logs-01.loggly.com/inputs/41096412-3533-4c39-bed4-a19e96b4aa42.gif?source=pixel&data=';
var url = 'http://logs-01.loggly.com/bulk/41096412-3533-4c39-bed4-a19e96b4aa42/tag/bulk/';
var sessionTimestamp = Date.now();

//module.exports = function (data) {
//	if (typeof data === 'string') {
//		data = {
//			message: data
//		};
//	}
//	data.sessionTimestamp = sessionTimestamp;
//	data.timestamp = Date.now();
//
//	var dataStr = JSON.stringify(data);
//
//	console.log(data.message, data);
//
//	//return fetch(url + dataStr);
//	return fetch(url, {
//		method: 'post',
//		headers: {
//			'Accept': 'application/json',
//			'Content-Type': 'application/json'
//		},
//		body: dataStr
//	});
//};

// tmp
module.exports = function () {
	console.log.apply(console, arguments);
};