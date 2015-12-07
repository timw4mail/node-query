"use strict";

/**
 * Driver for MySQL databases
 *
 * @module drivers/mysql
 */
module.exports = (function() {
	delete require.cache[require.resolve('../Driver')];
	var driver = require('../Driver'),
		helpers = require('../helpers');

	driver.identifierStartChar = '`';
	driver.identifierEndChar = '`';

	/**
	 * Override default limit method because mysql likes to be different
	 */
	driver.limit = function(sql, limit, offset) {
		if ( ! helpers.isNumber(offset))
		{
			return sql += " LIMIT " + limit;
		}

		return sql += " LIMIT " + offset + "," + limit;
	};

	return driver;

}());