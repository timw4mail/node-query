'use strict';

/** @module Adapter */
module.exports = class Adapter {
	/**
	 * Invoke an adapter
	 *
	 * @param  {Object} instance - The connection objec
	 * @return {void}
	 */
	constructor(instance) {
		this.instance = instance;
	}

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} callback - Callback to run when a response is recieved
	 * @return {void}
	 */
	execute(/*sql, params, callback*/) {
		throw new Error('Correct adapter not defined for query execution');
	}

	/**
	 * Close the current database connection
	 * @return {void}
	 */
	close() {
		this.instance.close();
	}
};