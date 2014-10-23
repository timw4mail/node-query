'use strict';

var adapter = require('../adapter.js');

/** @module adapters/mysql2 */
var MySQL2 = function(instance) {

	// That 'new' keyword is annoying
	if ( ! (this instanceof MySQL2)) return new MySQL2(instance);

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} callback - Callback to run when a response is recieved
	 * @return void
	 */
	adapter.execute = function(sql, params, callback) {
		instance.execute.apply(instance, arguments);
	};

	return adapter;
}

module.exports = MySQL2;