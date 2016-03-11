'use strict';

const Adapter = require('../Adapter');
const getArgs = require('getargs');
const promisify = require('../promisify');
const mysql2 = require('mysql2');

class Mysql extends Adapter {

	constructor(config) {
		let instance = mysql2.createConnection(config);
		instance.connect(err => {
			if (err) {
				throw new Error(err);
			}
		});
		super(instance);
	}

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

		if (! args.callback) {
			return new Promise((resolve, reject) => {
				this.instance.execute(args.sql, args.params, (err, result) => {
					if (err) {
						return reject(err);
					}

					return resolve(result);
				});
			});
		}

		return this.instance.execute(args.sql, args.params, args.callback);
	}
}

module.exports = Mysql;