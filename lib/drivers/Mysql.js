'use strict';

/**
 * Driver for MySQL databases
 *
 * @module drivers/mysql
 */
module.exports = (() => {
	delete require.cache[require.resolve('../Driver')];
	let driver = require('../Driver'),
		helpers = require('../helpers');

	driver.identifierStartChar = '`';
	driver.identifierEndChar = '`';

	/**
	 * Set the limit clause

	 * @param {String} sql - SQL statement to modify
	 * @param {Number} limit - Maximum number of rows to fetch
	 * @param {Number|null} offset - Number of rows to skip
	 * @return {String} - Modified SQL statement
	 */
	driver.limit = (sql, limit, offset) => {
		if (! helpers.isNumber(offset)) {
			return sql += ` LIMIT ${limit}`;
		}

		return sql += ` LIMIT ${offset},${limit}`;
	};

	return driver;

})();