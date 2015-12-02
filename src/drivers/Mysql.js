"use strict";

import helpers from '../helpers';
import Driver from '../DriverClass';

/**
 * Driver for MySQL databases
 *
 * @module drivers/mysql
 */
class Mysql extends Driver {
	constructor() {
		super({
			identifierStartChar: '`',
			identifierEndChar: '`'
		});
	}

	limit(sql, limit, offset) {
		if ( ! helpers.isNumber(offset))
		{
			return sql += ` LIMIT ${limit}`;
		}

		return sql += ` LIMIT ${offset}, ${limit}`;
	}
}

module.exports = new Mysql();