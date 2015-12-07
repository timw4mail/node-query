'use strict';

/**
 * Driver for PostgreSQL databases
 *
 * @module drivers/pg
 */
module.exports = (function() {
	delete require.cache[require.resolve('../Driver')];
	let driver = require('../Driver');

	return driver;
}());