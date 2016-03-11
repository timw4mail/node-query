'use strict';

const Adapter = require('../Adapter');
const getArgs = require('getargs');
const helpers = require('../helpers');
const promisify = require('../promisify');
const dbliteAdapter = require('dblite');

class Sqlite extends Adapter {
	constructor(config) {
		let file = (helpers.isString(config)) ? config : config.file;
		super(dbliteAdapter(file));

		// Stop the stupid 'bye bye' message being output
		this.instance.on('close', () => {});
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
			return promisify(this.instance.query)(args.sql, args.params);
		}

		return this.instance.query(args.sql, args.params, args.callback);
	}

	/**
	 * Close the current database connection

	 * @return {void}
	 */
	close() {
		this.instance.close();
	}
}

module.exports = Sqlite;
