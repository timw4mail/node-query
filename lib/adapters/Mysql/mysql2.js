'use strict';

const Adapter = require('../../Adapter');
const Result = require('../../Result');
const Helpers = require('../../Helpers');
const mysql2 = require('mysql2/promise');

class Mysql extends Adapter {

	constructor (config) {
		const instance = mysql2.createConnection(config);
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
		if (Helpers.type(result) === 'object') {
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
	 * @param {Array|undefined} params - The values to insert into the query
	 * @return {Promise} Result of query
	 */
	execute (sql, params) {
		return this.instance
			.then(conn => conn.execute(sql, params))
			.then(result => this.transformResult(result));
	}
}

module.exports = Mysql;
