'use strict';

import Adapter from '../Adapter';
import getArgs from 'getargs';

/** @module adapters/node-firebird */
module.exports = class nodefirebird extends Adapter {
	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} callback - Callback to run when a response is recieved
	 * @return void
	 */
	execute(/*sql, params, callback*/) {
		let args = getArgs('sql:string, [params], callback:function', arguments);
		this.instance.execute(args.sql, args.params, args.callback);
	}
}