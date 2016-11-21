'use strict';

/**
 * Driver for MySQL databases
 *
 * @module drivers/Mysql
 */
module.exports = (() => {
	delete require.cache[require.resolve('../Driver')];
	const driver = require('../Driver');
	const helpers = require('../helpers');

	driver.identifierStartChar = '`';
	driver.identifierEndChar = '`';

	/**
	 * Set the limit clause
	 *
	 * @param {String} sql - SQL statement to modify
	 * @param {Number} limit - Maximum number of rows to fetch
	 * @param {Number|null} offset - Number of rows to skip
	 * @return {String} - Modified SQL statement
	 */
	driver.limit = (sql, limit, offset) => {
		sql += (helpers.isNumber(offset))
			? ` LIMIT ${offset},${limit}`
			: ` LIMIT ${limit}`;

		return sql;
	};

	return driver;
})();
