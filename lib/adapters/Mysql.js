'use strict';

const Adapter = require('../Adapter');
const Result = require('../Result');
const helpers = require('../helpers');
const getArgs = require('getargs');
const mysql2 = require('mysql2');

class Mysql extends Adapter {

	constructor (config) {
		let instance = mysql2.createConnection(config);
		instance.connect(err => {
			if (err) {
				throw new Error(err);
			}
		});
		super(instance);
	}

	/**
	 * Transform the adapter's result into a standard format
	 *
	 * @param {*} result - original driver result object
	 * @return {Result} - standard result object
	 */
	transformResult (result) {
		// For insert and update queries, the result object
		// works differently. Just apply the properties of
		// this special result to the standard result object.
		if (helpers.type(result) === 'object') {
			let r = new Result();

			Object.keys(result).forEach(key => {
				r[key] = result[key];
			});

			return r;
		}

		return new Result(result);
	}

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @param {Function} [callback] - Callback to run when a response is recieved
	 * @return {void|Promise} - Returns a promise if no callback is provided
	 */
	execute (/* sql, params, callback */) {
		let args = getArgs('sql:string, [params]:array, [callback]:function', arguments);

		if (!args.callback) {
			return new Promise((resolve, reject) => {
				this.instance.execute(args.sql, args.params, (err, result) =>
					(err)
						? reject(err)
						: resolve(this.transformResult(result))
				);
			});
		}

		return this.instance.execute(args.sql, args.params, (err, rows) =>
			args.callback(err, this.transformResult(rows))
		);
	}
}

module.exports = Mysql;
