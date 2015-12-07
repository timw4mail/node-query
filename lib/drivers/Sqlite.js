"use strict";

/**
 * Driver for Sqlite databases
 *
 * @module drivers/sqlite
 */
module.exports = (function() {
	delete require.cache[require.resolve('../Driver')];
	var driver = require('../Driver'),
		helpers = require('../helpers');

	// Sqlite doesn't have a truncate command
	driver.hasTruncate = false;

	/**
	 * SQL to insert a group of rows
	 * Override default to have better compatibility
	 *
	 * @param {String} table - The table to insert to
	 * @param {Array} [data] - The array of object containing data to insert
	 * @return {String}
	 */
	driver.insertBatch = function(table, data) {

		// Get the data values to insert, so they can
		// be parameterized
		var sql = "",
			vals = [],
			cols = [],
			fields = [],
			first = data.shift(),
			params = [],
			paramString = "",
			paramList = [];


		data.forEach(function(obj) {
			var row = [];
			Object.keys(obj).forEach(function(key) {
				row.push(obj[key]);
			});
			vals.push(row);
		});

		sql += "INSERT INTO " + driver.quoteTable(table) + "\n";

		// Get the field names from the keys of the first
		// object to be inserted
		fields = Object.keys(first);
		Object.keys(first).forEach(function(key) {
			cols.push("'" + driver._quote(first[key]) + "' AS " + driver.quoteIdentifiers(key));
		});

		sql += "SELECT " + cols.join(', ') + "\n";

		vals.forEach(function(row_values) {
			var quoted = row_values.map(function(value) {
				return String(value).replace("'", "'\'");
			});
			sql += "UNION ALL SELECT '" + quoted.join("', '") + "'\n";
		});

		return {
			sql: sql,
			values: null
		};
	}

	return driver;
}());