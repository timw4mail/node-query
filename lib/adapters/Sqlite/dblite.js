'use strict';

const Adapter = require('../../Adapter');
const Result = require('../../Result');
const helpers = require('../../helpers');
const dbliteAdapter = require('dblite');

class SqliteDblite extends Adapter {
	constructor (config) {
		let file = (helpers.isString(config)) ? config : config.file;

		const instance = new Promise((resolve, reject) => {
			let conn = dbliteAdapter(file);

			// Stop the stupid 'bye bye' message being output
			conn.on('close', () => {});

			conn.on('error', err => {
				reject(err);
			});

			// Make sure to actually pass on the connection!
			return resolve(conn);
		});

		super(instance);
	}

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @return {Promise} - Returns a promise if no callback is provided
	 */
	execute (sql, params) {
		return this.instance.then(conn => new Promise((resolve, reject) => {
			return conn.query(sql, params, (err, rows) => {
				if (err) {
					return reject(err);
				}
				return resolve(this.transformResult(rows));
			});
		}));
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
	 *
	 * @return {void}
	 */
	close () {
		this.instance.then(conn => conn.close());
	}
}

module.exports = SqliteDblite;
