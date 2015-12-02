"use strict";

import helpers from '../helpers';
import Driver from '../DriverClass';

/**
 * Driver for Firebird databases
 *
 * @module drivers/firebird
 */
class Firebird extends Driver {
	constructor() {
		super({
			hasTruncate: false
		});
	}

	/**
	 * Generate a limit clause for firebird, which uses the syntax closest to the SQL standard
	 *
	 * @param {String} sql
	 * @param {Number} limit
	 * @param {Number} offset
	 * @return {String}
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
	 * @return {String}
	 */
	insertBatch() {
		throw new Error("Not Implemented");
	}
}

module.exports = new Firebird();