'use strict';

let Adapter = require('../Adapter'),
	getArgs = require('getargs');

module.exports = class pg extends Adapter {
	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} [callback] - Callback to run when a response is recieved
	 * @return {void|Promise} - Returns a promise if no callback is provided
	 */
	execute(/*sql, params, callback*/) {
		let args = getArgs('sql:string, [params]:array, [callback]:function', arguments);

		// Replace question marks with numbered placeholders, because this adapter is different...
		let count = 0;
		args.sql = args.sql.replace(/\?/g, () => {
			count++;
			return `$${count}`;
		});

		if (! args.callback) {
			return new Promise((resolve, reject) => {
				this.instance.query(args.sql, args.params, (err, result) => {
					if (err) {
						return reject(err);
					}

					return resolve(result);
				});
			});
		}

		return this.instance.query(args.sql, args.params, args.callback);
	}
};