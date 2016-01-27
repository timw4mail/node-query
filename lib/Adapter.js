
'use strict';

/**
 * Class that wraps database connection libraries
 *
 * @private
 * @param  {Object} instance - The connection object
 */
class Adapter {
	/**
	 * Invoke an adapter
	 *
	 * @constructor
	 * @param  {Object} instance - The connection object
	 */
	constructor(instance) {
		this.instance = instance;
	}

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} [callback] - Callback to run when a response is recieved
	 * @return {void|Promise} - returns a promise if no callback is passed
	 */
	execute(/*sql, params, callback*/) {
		throw new Error('Correct adapter not defined for query execution');
	}

	/**
	 * Close the current database connection
	 * @return {void}
	 */
	close() {
		this.instance.end();
	}
}

module.exports = Adapter;