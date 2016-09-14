'use strict';

const Adapter = require('../Adapter');
const Result = require('../Result');
const getArgs = require('getargs');
const helpers = require('../helpers');
const dbliteAdapter = require('dblite');

class Sqlite extends Adapter {
	constructor (config) {
		let file = (helpers.isString(config)) ? config : config.file;
		super(dbliteAdapter(file));

		// Stop the stupid 'bye bye' message being output
		this.instance.on('close', () => {});
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
	 * @param {Function} [callback] - Callback to run when a response is recieved
	 * @return {void|Promise} - Returns a promise if no callback is provided
	 */
	execute (/* sql, params, callback */) {
		let args = getArgs('sql:string, [params]:array, [callback]:function', arguments);

		if (!args.callback) {
			return new Promise((resolve, reject) => {
				this.instance.query(args.sql, args.params, (err, result) =>
					(err)
						? reject(err)
						: resolve(this.transformResult(result))
				);
			});
		}

		return this.instance.query(args.sql, args.params, (err, res) => {
			args.callback(err, this.transformResult(res));
		});
	}

	/**
	 * Close the current database connection

	 * @return {void}
	 */
	close () {
		this.instance.close();
	}
}

module.exports = Sqlite;
