'use strict';

var helpers = require('./helpers');

/**
 * Base Database Driver
 *
 * @module driver
 */
var d = {
	identifierStartChar: '"',
	identifierEndChar: '"',
	tablePrefix: null,
	hasTruncate: true,

	/**
	 * Low level function for naive quoting of strings

	 * @param {String} str
	 * @return {String}
	 * @private
	 */
	_quote: function(str) {
		return (helpers.isString(str) && ! (str.startsWith(d.identifierStartChar) || str.endsWith(d.identifierEndChar)))
			? d.identifierStartChar + str + d.identifierEndChar
			: str;
	},

	/**
	 * Set the limit clause

	 * @param {String} sql
	 * @param {Number} limit
	 * @param {Number|null} offset
	 * @return {String}
	 */
	limit: function(sql, limit, offset) {
		sql += " LIMIT " + limit;

		if (helpers.isNumber(offset))
		{
			sql += " OFFSET " + offset;
		}

		return sql;
	},

	/**
	 * Quote database table name, and set prefix
	 *
	 * @param {String} table
	 * @return {String}
	 */
	quoteTable: function(table) {
		// Quote after prefix
		return d.quoteIdentifiers(table);
	},

	/**
	 * Use the driver's escape character to quote identifiers
	 *
	 * @param {String|Array}
	 * @return {String|Array}
	 */
	quoteIdentifiers: function(str) {
		var hiers, raw;
		var pattern = new RegExp(d.identifierStartChar + '(' + '([a-zA-Z0-9_]+)' + '(\((.*?)\))' + ')' + d.identifierEndChar, 'ig');

		// Recurse for arrays of identifiiers
		if (Array.isArray(str))
		{
			return str.map(d.quoteIdentifiers);
		}

		// Handle commas
		if (str.includes(','))
		{
			var parts = str.split(',').map(helpers.stringTrim);
			str = parts.map(d.quoteIdentifiers).join(',');
		}

		// Split identifiers by period
		hiers = str.split('.').map(d._quote);
		raw = hiers.join('.');

		// Fix functions
		if (raw.includes('(') && raw.includes(')'))
		{
			var funcs = pattern.exec(raw);

			// Unquote the function
			raw = raw.replace(funcs[0], funcs[1]);

			// Quote the identifiers inside of the parens
			var inParens = funcs[3].substring(1, funcs[3].length -1);
			raw = raw.replace(inParens, d.quoteIdentifiers(inParens));
		}

		return raw;
	},

	/**
	 * SQL to truncate the passed table
	 *
	 * @param {String} table
	 * @return {String} - sql
	 */
	truncate: function(table) {
		var sql = (d.hasTruncate)
			? 'TRUNCATE '
			: 'DELETE FROM ';

		sql += d.quoteTable(table);

		return sql;
	},

	/**
	 * SQL to insert a group of rows
	 *
	 * @param {String} table - The table to insert to
	 * @param {Array} [data] - The array of object containing data to insert
	 * @return {String}
	 */
	insertBatch: function(table, data) {
		var vals = [],
			fields = Object.keys(data[0]),
			sql = "",
			params = [],
			paramString = "",
			paramList = [];

		// Get the data values to insert, so they can
		// be parameterized
		data.forEach(function(obj) {
			Object.keys(obj).forEach(function(key) {
				vals.push(obj[key]);
			});
		});

		// Get the field names from the keys of the first
		// object inserted
		table = d.quoteTable(table);

		sql += "INSERT INTO " + table + " ("
			+ d.quoteIdentifiers(fields).join(",")
			+ ") VALUES ";

		// Create placeholder groups
		params = Array(fields.length).fill('?');
		paramString = "(" + params.join(',') + ")";
		paramList = Array(data.length).fill(paramString);

		sql += paramList.join(',');

		return {
			sql: sql,
			values: vals
		};
	}

};

module.exports = d;