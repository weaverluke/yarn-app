'use strict';

var DeviceInfo = require('react-native-device-info');
//var url = 'https://logs-01.loggly.com/inputs/41096412-3533-4c39-bed4-a19e96b4aa42.gif?source=pixel&data=';
var url = 'http://logs-01.loggly.com/bulk/41096412-3533-4c39-bed4-a19e96b4aa42/tag/bulk/';
var sessionTimestamp = Date.now();

var deviceId = DeviceInfo.getUniqueID();

module.exports = function (data) {
	if (typeof data === 'string') {
		data = {
			message: data
		};
	}
	data.sessionTimestamp = sessionTimestamp;
	data.timestamp = Date.now();
	data.deviceId = deviceId;

	// put only message first, if JSON.stringify() fails in try-catch block then
	// just that message will be sent
	var dataStr = JSON.stringify({
		message: data.message,
		additionalInfo: 'possible JSON.stringfiy() in logger error'
	});

	try {
		dataStr = JSON.stringify(data);
	} catch (ex) {}


	console.log(data.message, data);

	//return fetch(url + dataStr);
	return fetch(url, {
		method: 'post',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: dataStr
	}).catch(function () {});
};

// tmp
//module.exports = function () {
//	console.log.apply(console, arguments);
//};