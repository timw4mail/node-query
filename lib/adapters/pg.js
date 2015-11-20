'use strict';

var adapter = require('../adapter'),
	getArgs = require('getargs');

/** @module adapters/pg */
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
	adapter.execute = function(/*sql, params, callback*/) {
		var args = getArgs('sql:string, [params]:array, callback:function', arguments);

		// Replace question marks with numbered placeholders, because this adapter is different...
		var count = 0;
		args.sql = args.sql.replace(/\?/g, function() {
			count++;
			return '$' + count;
		});

		instance.query(args.sql, args.params, args.callback);
	};

	return adapter;
}

module.exports = Pg;