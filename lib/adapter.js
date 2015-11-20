'use strict';

/** @module adapter */
module.exports = {

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} callback - Callback to run when a response is recieved
	 * @return void
	 */
	execute: function(/*sql, params, callback*/) {
		throw new Error("Correct adapter not defined for query execution");
	}
};