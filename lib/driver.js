'use strict';

var helpers = require('./helpers');

/**
 * Base Database Driver
 *
 * @module driver
 */
var d = {
	identifierChar: '"',
	tablePrefix: null,

	/**
	 * Low level function for naive quoting of strings

	 * @param {String} str
	 * @return {String}
	 * @private
	 */
	_quote: function(str) {
		return (helpers.isString(str) && ! (str.startsWith(d.identifierChar) || str.endsWith(d.identifierChar)))
			? d.identifierChar + str + d.identifierChar
			: str;
	},

	/**
	 * Sets the table prefix on the passed string
	 *
	 * @param {String} str
	 * @return {String}
	 * @private
	 */
	_prefix: function(str) {
		if (str.startsWith(d.prefix))
		{
			return str;
		}

		return d.prefix + str;
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
	 * Prefixes a table if it is not already prefixed
	 *
	 * @param {String} table
	 * @return {String}
	 */
	prefixTable: function(table) {
		if (d.tablePrefix)
		{
			// Split identifier by period, will split into:
			// database.schema.table OR
			// schema.table OR
			// database.table OR
			// table
			var idents = table.split('.', table);
			var segments = idents.length;

			// Add the database prefix
			idents[segments - 1] = d._prefix(idents[segments - 1]);

			table = idents.join('.');
		}

		return table;
	},

	/**
	 * Quote database table name, and set prefix
	 *
	 * @param {String} table
	 * @return {String}
	 */
	quoteTable: function(table) {
		table = d.prefixTable(table);

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
		var pattern = new RegExp(d.identifierChar + '(' + '([a-zA-Z0-9_]+)' + '(\((.*?)\))' + ')' + d.identifierChar, 'ig');

		// Recurse for arrays of identifiiers
		if (Array.isArray(str))
		{
			return str.map(d.quoteIdentifiers);
		}

		// Handle commas
		if (str.contains(','))
		{
			var parts = str.split(',').map(helpers.stringTrim);
			str = parts.map(d.quoteIdentifiers).join(',');
		}

		// Split identifiers by period
		hiers = str.split('.').map(d._quote);
		raw = hiers.join('.');

		// Fix functions
		if (raw.contains('(') && raw.contains(')'))
		{
			var funcs = pattern.exec(raw);

			// Unquote the function
			raw = raw.replace(funcs[0], funcs[1]);

			// Quote the identifiers inside of the parens
			var inParens = funcs[3].substring(1, funcs[3].length -1);
			raw = raw.replace(inParens, d.quoteIdentifiers(inParens));
		}

		return raw;
	}
};

module.exports = d;