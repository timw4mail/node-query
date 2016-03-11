'use strict';

const Adapter = require('../Adapter');
const getArgs = require('getargs');
const fb = require('node-firebird');

class Firebird extends Adapter {

	constructor(config) {
		super({});
		fb.attach(config, (err, instance) => {
			this.instance = instance;
		});
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
		let args = getArgs('sql:string, [params], [callback]:function', arguments);

		if (! args.callback) {
			//return instance.queryAsync(args.sql, args.params);
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
}

module.exports = Firebird;