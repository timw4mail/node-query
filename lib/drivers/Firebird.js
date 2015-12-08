'use strict';

let helpers = require('../helpers');

/**
 * Driver for Firebird databases
 *
 * @module drivers/firebird
 */
module.exports = (function() {
	delete require.cache[require.resolve('../Driver')];
	let driver = require('../Driver');

	driver.hasTruncate = false;

	/**
	 * Set the limit clause

	 * @param {String} origSql - SQL statement to modify
	 * @param {Number} limit - Maximum number of rows to fetch
	 * @param {Number|null} offset - Number of rows to skip
	 * @return {String} - Modified SQL statement
	 */
	driver.limit = function(origSql, limit, offset) {
		let sql = `FIRST ${limit}`;

		if (helpers.isNumber(offset))
		{
			sql += ` SKIP ${offset}`;
		}

		return origSql.replace(/SELECT/i, `SELECT ${sql}`);
	};

	/**
	 * SQL to insert a group of rows
	 *
	 * @return {void}
	 * @throws {Error}
	 */
	driver.insertBatch = function() {
		throw new Error('Not Implemented');
	};

	return driver;
}());