'use strict';

/**
 * Driver for Microsoft SQL Server databases
 *
 * @module drivers/MSSQLDriver
 */
module.exports = (() => {
	delete require.cache[require.resolve('../Driver')];
	const driver = require('../Driver');
	const Helpers = require('../Helpers');

	driver.identifierStartChar = '[';
	driver.identifierEndChar = ']';

	return driver;
})();
