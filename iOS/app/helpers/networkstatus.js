'use strict';

var React = require('react-native');
var {
	NetInfo
} = React;


module.exports = (function () {

	var status = {
		isConnected: true
	};

	NetInfo.isConnected.fetch().done(function (isConnected) {
		status.isConnected = isConnected;
	});

	NetInfo.isConnected.addEventListener('change', function (isConnected) {
		status.isConnected = isConnected;
	});

	return {
		isOk: function () {
			return status.isConnected
		}
	};

}());
