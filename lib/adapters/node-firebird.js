'use strict';

let Adapter = require('../Adapter'),
	getArgs = require('getargs'),
	Promise = require('bluebird');

module.exports = class nodefirebird extends Adapter {
	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} [callback] - Callback to run when a response is recieved
	 * @return {void|Promise} - Returns a promise if no callback is provided
	 */
	execute(/*sql, params, callback*/) {
		let args = getArgs('sql:string, [params], [callback]:function', arguments);
		let instance = Promise.promisifyAll(this.instance);

		if (! args.callback) {
			return instance.queryAsync(args.sql, args.params);
		}

		return this.instance.query(args.sql, args.params, args.callback);
	}

	/**
	 * Close the current database connection
	 * @return {void}
	 */
	close() {
		this.instance.detach();
	}
};