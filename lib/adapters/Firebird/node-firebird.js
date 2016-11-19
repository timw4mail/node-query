'use strict';

const Adapter = require('../../Adapter');
const Result = require('../../Result');
const fb = require('node-firebird');

class Firebird extends Adapter {
	constructor (config) {
		super({});
		this.instance = new Promise((resolve, reject) => {
			fb.attach(config, (err, instance) => {
				if (err) {
					return reject(err);
				}

				return resolve(instance);
			});
		});
	}

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @return {Promise} - Returns a promise if no callback is provided
	 */
	execute (sql, params) {
		return this.instance.then(conn => {
			return new Promise((resolve, reject) => {
				conn.query(sql, params, (err, result) => {
					if (err) {
						return reject(err);
					}

					return resolve(this.transformResult(result));
				});
			});
		});
	}

	/**
	 * Transform the adapter's result into a standard format
	 *
	 * @param {*} originalResult - the original result object from the driver
	 * @return {Result} - the new result object
	 */
	transformResult (originalResult) {
		return new Result(originalResult);
	}

	/**
	 * Close the current database connection
	 * @return {void}
	 */
	close () {
		this.instance.then(conn => conn.detach());
	}
}

module.exports = Firebird;
