"use strict";

module.exports = function(driverType, connObject) {

	var connection = null,
		driverType = null;

	return {
		connect: function(driverName, connObject) {
			driverType = driverName;
			connection = connObject;
		}
	};
};