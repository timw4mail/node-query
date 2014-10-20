"use strict";

/**
 * Driver for MySQL databases
 *
 * @returns {driver}
 */
module.exports = function() {
	var driver = require('../driver'),
		helpers = require('../helpers');

	driver.identifierChar = '`';

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
};