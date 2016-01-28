var DeviceInfo = require('react-native-device-info');
var GAnalytics = require('react-native-google-analytics');

var clientId = DeviceInfo.getUniqueID();
var {
	Analytics,
	Hits
} = GAnalytics;

var config = require('../config');

var ga = new Analytics(config.GA_TOKEN, clientId);

module.exports = {
	event: function (category, action, optLabel, optValue, optNonInteraction) {
		var ev = new Hits.Event(category, action, optLabel, optValue, optNonInteraction);
		ga.send(ev);
	}
};
