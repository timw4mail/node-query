'use strict';

var adapter = require('../adapter.js');

/** @module adapters/mysql2 */
var Pg = function(instance) {

	// That 'new' keyword is annoying
	if ( ! (this instanceof Pg)) return new Pg(instance);

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} callback - Callback to run when a response is recieved
	 * @return void
	 */
	adapter.execute = function(sql, params, callback) {
		instance.query.apply(instance, arguments);
	};

	return adapter;
}

module.exports = Pg;