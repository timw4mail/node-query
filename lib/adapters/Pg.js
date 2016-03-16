'use strict';

const Adapter = require('../Adapter');
const Result = require('../Result');
const getArgs = require('getargs');
const helpers = require('../helpers');
const pg = require('pg');
const url = require('url');

class Pg extends Adapter {

	constructor(config) {
		let instance = null;
		let connectionString = '';
		if (helpers.isObject(config)) {
			let host = config.host || 'localhost';
			let user = config.user || 'postgres';
			let password = `:${config.password}` || '';
			let port = config.port || 5432;

			let conn = {
				protocol: 'postgres',
				slashes: true,
				host: `${host}:${port}`,
				auth: `${user}${password}`,
				pathname: config.database,
			};

			connectionString = url.format(conn);
		} else if (helpers.isString(config)) {
			connectionString = config;
		}

		if (connectionString !== '') {
			let connected = false;
			instance = new pg.Client(connectionString);

			instance.connect(err => {
				connected = true;

				if (err) {
					throw new Error(err);
				}
			});
		}

		super(instance);
	}

	/**
	 * Transform the adapter's result into a standard format
	 *
	 * @param {*} result - original driver result object
	 * @return {Result} - standard result object
	 */
	transformResult(result) {
		if (result == null) {
			return new Result();
		}

		let cols = [];
		result.fields.forEach(field => cols = field.name);

		return new Result(result.rows, cols);
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

		// Replace question marks with numbered placeholders, because this adapter is different...
		let count = 0;
		args.sql = args.sql.replace(/\?/g, () => {
			count++;
			return `$${count}`;
		});

		if (! args.callback) {
			return new Promise((resolve, reject) => {
				this.instance.query(args.sql, args.params, (err, result) =>
					(err)
						? reject(err)
						: resolve(this.transformResult(result))
				);
			});
		}

		return this.instance.query(args.sql, args.params, (err, origResult) => {
			let result = this.transformResult(origResult);
			return args.callback(err, result);
		});
	}
}

module.exports = Pg;