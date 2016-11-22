'use strict';

/**
 * Driver for Microsoft SQL Server databases
 *
 * @module drivers/MSSQLDriver
 */
module.exports = (() => {
	delete require.cache[require.resolve('../Driver')];
	const driver = require('../Driver');
	const helpers = require('../helpers');

	driver.identifierStartChar = '[';
	driver.identifierEndChar = ']';

	return driver;
})();
