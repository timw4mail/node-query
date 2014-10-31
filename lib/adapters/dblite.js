'use strict';

var adapter = require('../adapter'),
	getArgs = require('getargs');

/** @module adapters/dblite */
var Dblite = function(instance) {

	// That 'new' keyword is annoying
	if ( ! (this instanceof Dblite)) return new Dblite(instance);

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} callback - Callback to run when a response is recieved
	 * @return void
	 */
	adapter.execute = function(/*sql, params, callback*/) {
		var args = getArgs('sql:string, [params]:array, callback:function', arguments);

		instance.query(args.sql, args.params, args.callback);
	};

	return adapter;
}

module.exports = Dblite;