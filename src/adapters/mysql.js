'use strict';

import Adapter from '../Adapter';

/** @module adapters/mysql */
module.exports = class mysql extends Adapter {
	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} callback - Callback to run when a response is recieved
	 * @return void
	 */
	execute(sql, params, callback) {
		this.instance.query.apply(instance, arguments);
	}
}