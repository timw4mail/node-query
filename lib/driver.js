/** @module driver */

"use strict";

var helpers = require('./helpers');

/**
 * Base Database Driver
 *
 * @type {{identifierChar: string, quoteIdentifiers: quoteIdentifiers}}
 */
module.exports = {
	identifierChar: '"',
	tablePrefix: null,

	/**
	 * Low level function for naive quoting of strings

	 * @param {String} str
	 * @return {String}
	 * @private
	 */
	_quote: function(str) {
		return (helpers.isString(str) && ! (str.startsWith(this.identifierChar) || str.endsWith(this.identifierChar)))
			? this.identifierChar + str + this.identifierChar
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
		if (str.startsWith(this.prefix))
		{
			return str;
		}

		return this.prefix + str;
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
		if (this.tablePrefix)
		{
			// Split identifier by period, will split into:
			// database.schema.table OR
			// schema.table OR
			// database.table OR
			// table
			var idents = table.split('.', table);
			var segments = idents.length;

			// Add the database prefix
			idents[segments - 1] = this._prefix(idents[segments - 1]);

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
		table = this.prefixTable(table);

		// Quote after prefix
		return this.quoteIdentifiers(table);
	},

	/**
	 * Use the driver's escape character to quote identifiers
	 *
	 * @param {String|Array}
	 * @return {String|Array}
	 */
	quoteIdentifiers: function(str) {
		var hiers, raw;

		// Recurse for arrays of identifiiers
		if (Array.isArray(str))
		{
			return str.map(this.quoteIdentifiers);
		}

		// Handle commas
		str = helpers.splitTrim(',', str);

		// Split identifiers by period
		hiers = str.split('.').map(String.trim).map(this._quote);
		raw = hiers.join('.');

		// TODO: fix functions

		return raw;
	}
};