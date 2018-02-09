const Adapter = require('../../Adapter');
const Result = require('../../Result');
const Helpers = require('../../Helpers');
const sqlite3 = require('sqlite3').verbose();

class SqliteSqlite3 extends Adapter {
	constructor (config) {
		const file = (Helpers.isString(config)) ? config : config.file;

		const instance = new Promise((resolve, reject) => {
			const conn = new sqlite3.Database(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
				if (err) {
					reject(err);
				}
			});

			conn.on('open', resolve(conn));
		});

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
		return this.instance.then(conn => new Promise((resolve, reject) => {
			conn.all(sql, params, (err, rows) => {
				if (err) {
					return reject(err);
				}
				return resolve(this.transformResult(rows));
			});
		}));
	}

	/**
	 * Close the current database connection

	 * @return {void}
	 */
	close () {
		this.instance.then(conn => conn.close());
	}
}

module.exports = SqliteSqlite3;
