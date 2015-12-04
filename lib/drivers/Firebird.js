"use strict";

let helpers = require('../helpers'),
	Driver = require('../DriverClass');

class Firebird extends Driver {
	constructor() {
		super({
			hasTruncate: false
		});
	}

	/**
	 * Set the limit clause
	 *
	 * @param {String} origSql - SQL statement to modify
	 * @param {Number} limit - Maximum number of rows to fetch
	 * @param {Number|null} offset - Number of rows to skip
	 * @return {String} - Modified SQL statement
	 */
	limit(origSql, limit, offset) {
		let sql = `FIRST  ${limit}`;

		if (helpers.isNumber(offset))
		{
			sql += ` SKIP  ${offset}`;
		}

		return origSql.replace(/SELECT/i, "SELECT " + sql);
	}

	/**
	 * SQL to insert a group of rows
	 *
	 * @param {String} table - The table to insert to
	 * @param {Array} [data] - The array of object containing data to insert
	 * @return {String} - Query and data to insert
	 */
	insertBatch() {
		throw new Error("Not Implemented");
	}
}

module.exports = new Firebird();