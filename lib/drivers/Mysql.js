"use strict";

let helpers = require('../helpers'),
	Driver = require('../DriverClass');

class Mysql extends Driver {
	constructor() {
		super({
			identifierStartChar: '`',
			identifierEndChar: '`'
		});
	}

	/**
	 * Set the limit clause
	 *
	 * @param {String} sql - SQL statement to modify
	 * @param {Number} limit - Maximum number of rows to fetch
	 * @param {Number|null} offset - Number of rows to skip
	 * @return {String} - Modified SQL statement
	 */
	limit(sql, limit, offset) {
		if ( ! helpers.isNumber(offset))
		{
			return sql += ` LIMIT ${limit}`;
		}

		return sql += ` LIMIT ${offset}, ${limit}`;
	}
}

module.exports = new Mysql();