"use strict";

var helpers = require('../helpers');

/**
 * Driver for Firebird databases
 *
 * @module drivers/firebird
 */
module.exports = (function() {
	delete require.cache[require.resolve('../Driver')];
	var driver = require('../Driver');

	driver.hasTruncate = false;

	/**
	 * Generate a limit clause for firebird, which uses the syntax closest to the SQL standard
	 *
	 * @param {String} sql
	 * @param {Number} limit
	 * @param {Number} offset
	 * @return {String}
	 */
	driver.limit = function(origSql, limit, offset) {
		var sql = 'FIRST ' + limit;

		if (helpers.isNumber(offset))
		{
			sql += ' SKIP ' + offset;
		}

		return origSql.replace(/SELECT/i, "SELECT " + sql);;
	};

	/**
	 * SQL to insert a group of rows
	 *
	 * @param {String} table - The table to insert to
	 * @param {Array} [data] - The array of object containing data to insert
	 * @return {String}
	 */
	driver.insertBatch = function(table, data) {
		throw new Error("Not Implemented");
	};

	return driver;
}());