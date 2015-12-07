'use strict';

let Adapter = require('../Adapter'),
	getArgs = require('getargs');

module.exports = class pg extends Adapter {
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

		// Replace question marks with numbered placeholders, because this adapter is different...
		let count = 0;
		args.sql = args.sql.replace(/\?/g, () => {
			count++;
			return `$${count}`;
		});

		this.instance.query(args.sql, args.params, args.callback);
	}
}