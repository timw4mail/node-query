"use strict";

/**
 * Driver for PostgreSQL databases
 *
 * @module drivers/pg
 */
module.exports = (function() {
	delete require.cache[require.resolve('../driver')];
	var driver = require('../driver');

	return driver;
}());