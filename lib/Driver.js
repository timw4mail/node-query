'use strict';

let helpers = require('./helpers');

/**
 * Base Database Driver
 *
 * @module driver
 */
let d = {
	identifierStartChar: '"',
	identifierEndChar: '"',
	tablePrefix: null,
	hasTruncate: true,

	/**
	 * Low level function for naive quoting of strings

	 * @param {String} str - The sql fragment to quote
	 * @return {String} - The quoted sql fragment
	 * @private
	 */
	_quote(str) {
		return (helpers.isString(str) && ! (str.startsWith(d.identifierStartChar) || str.endsWith(d.identifierEndChar)))
			? `${d.identifierStartChar}${str}${d.identifierEndChar}`
			: str;
	},

	/**
	 * Set the limit clause

	 * @param {String} sql - SQL statement to modify
	 * @param {Number} limit - Maximum number of rows to fetch
	 * @param {Number|null} offset - Number of rows to skip
	 * @return {String} - Modified SQL statement
	 */
	limit(sql, limit, offset) {
		sql +=  ` LIMIT ${limit}`;

		if (helpers.isNumber(offset))
		{
			sql += ` OFFSET ${offset}`;
		}

		return sql;
	},

	/**
	 * Quote database table name, and set prefix
	 *
	 * @param {String} table - Table name to quote
	 * @return {String} - Quoted table name
	 */
	quoteTable(table) {
		// Quote after prefix
		return d.quoteIdentifiers(table);
	},

	/**
	 * Use the driver's escape character to quote identifiers
	 *
	 * @param {String|String[]} - String or array of strings to quote identifiers
	 * @return {String|String[]} - Quoted identifier(s)
	 */
	quoteIdentifiers(str) {
		let hiers, raw;
		let pattern = new RegExp(
			`${d.identifierStartChar}(`
				+ '([a-zA-Z0-9_]+)' + '(\((.*?)\))'
				+ `)${d.identifierEndChar}`, 'ig');

		// Recurse for arrays of identifiiers
		if (Array.isArray(str))
		{
			return str.map(d.quoteIdentifiers);
		}

		// Handle commas
		if (str.includes(','))
		{
			let parts = str.split(',').map(helpers.stringTrim);
			str = parts.map(d.quoteIdentifiers).join(',');
		}

		// Split identifiers by period
		hiers = str.split('.').map(d._quote);
		raw = hiers.join('.');

		// Fix functions
		if (raw.includes('(') && raw.includes(')'))
		{
			let funcs = pattern.exec(raw);

			// Unquote the function
			raw = raw.replace(funcs[0], funcs[1]);

			// Quote the identifiers inside of the parens
			let inParens = funcs[3].substring(1, funcs[3].length -1);
			raw = raw.replace(inParens, d.quoteIdentifiers(inParens));
		}

		return raw;
	},

	/**
	 * SQL to truncate the passed table
	 *
	 * @param {String} table - Table to truncate
	 * @return {String} - Truncation SQL
	 */
	truncate(table) {
		let sql = (d.hasTruncate)
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
	 * @return {String} - Query and data to insert
	 */
	insertBatch(table, data) {
		let vals = [],
			fields = Object.keys(data[0]),
			sql = "",
			params = [],
			paramString = "",
			paramList = [];

		// Get the data values to insert, so they can
		// be parameterized
		data.forEach(obj => {
			Object.keys(obj).forEach(key => {
				vals.push(obj[key]);
			});
		});

		// Get the field names from the keys of the first
		// object inserted
		table = d.quoteTable(table);

		sql += `INSERT INTO ${table} (${d.quoteIdentifiers(fields).join(",")}) VALUES `;

		// Create placeholder groups
		params = Array(fields.length).fill('?');
		paramString = `(${params.join(',')})`;
		paramList = Array(data.length).fill(paramString);

		sql += paramList.join(',');

		return {
			sql: sql,
			values: vals
		};
	}

};

module.exports = d;