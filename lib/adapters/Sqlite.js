'use strict';

const Adapter = require('../Adapter');
const Result = require('../Result');
const helpers = require('../helpers');
const dbliteAdapter = require('dblite');

class Sqlite extends Adapter {
	constructor (config) {
		let file = (helpers.isString(config)) ? config : config.file;

		const instance = Promise.resolve(dbliteAdapter(file)).then(conn => {
			// Stop the stupid 'bye bye' message being output
			conn.on('close', () => {});

			conn.on('error', (err) => {
				throw new Error(err);
			});

			// Make sure to actually pass on the connection!
			return conn;
		}).catch(e => console.error(e));

		super(instance);
	}

	/**
	 * Transform the adapter's result into a standard format
	 *
	 * @param {*} result  - original driver result object
	 * @return {Result} - standard result object
	 */
	transformResult (result) {
		return new Result(result);
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
			return conn.query(sql, params, (err, result) => {
				if (err) {
					throw new Error(err);
				}
				return Promise.resolve(this.instance).then(() => result);
			});
		});
	}

	/**
	 * Close the current database connection

	 * @return {void}
	 */
	close () {
		this.instance.then(conn => conn.close());
	}
}

module.exports = Sqlite;
