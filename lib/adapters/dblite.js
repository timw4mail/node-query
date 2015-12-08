'use strict';

let Adapter = require('../Adapter'),
	getArgs = require('getargs');

module.exports = class dblite extends Adapter {
	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} callback - Callback to run when a response is recieved
	 * @return {void}
	 */
	execute(/*sql, params, callback*/) {
		let args = getArgs('sql:string, [params]:array, callback:function', arguments);
		this.instance.query(args.sql, args.params, args.callback);
	}

	/**
	 * Close the current database connection
	 * @return {void}
	 */
	close() {
		this.instance.close();
	}
};