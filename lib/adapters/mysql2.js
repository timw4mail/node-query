'use strict';

let Adapter = require('../Adapter'),
	getArgs = require('getargs');

module.exports = class mysql2 extends Adapter {
	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} callback - Callback to run when a response is recieved
	 * @return {void}
	 */
	execute(/*sql, params, callback*/) {
		let args = getArgs('sql:string, [params], callback:function', arguments);
		return this.instance.execute(args.sql, args.params, args.callback);
		//this.instance.execute.apply(this.instance, args);
	}
}