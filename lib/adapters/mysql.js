'use strict';

var adapter = require('../adapter.js');
var conn;

/** @module adapters/mysql */
var MySQL = function(instance) {

	// That 'new' keyword is annoying
	if ( ! (this instanceof MySQL)) return new MySQL(instance);

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
};

module.exports = MySQL;