const Adapter = require('../../Adapter');
const Result = require('../../Result');
const Helpers = require('../../Helpers');
const pg = require('pg');
const url = require('url');

class Pg extends Adapter {
	constructor (config) {
		let instance = null;
		let connectionString = Pg.formatConnectionString(config);

		if (connectionString !== '') {
			const conn = new pg.Client(connectionString);
			conn.connect(err => {
				if (err) {
					throw new Error(err);
				}
			});

			instance = Promise.resolve(conn);
		}

		super(instance);
	}

	/**
	 * Convert the connection object to a connection string
	 *
	 * @param {Object} config - the configuration object
	 * @return {String} - the connection string
	 */
	static formatConnectionString (config) {
		let connectionString = '';

		if (Helpers.isObject(config)) {
			const host = config.host || 'localhost';
			const user = config.user || 'postgres';
			const password = `:${config.password}` || '';
			const port = config.port || 5432;

			const conn = {
				protocol: 'postgres',
				slashes: true,
				host: `${host}:${port}`,
				auth: `${user}${password}`,
				pathname: config.database
			};

			connectionString = url.format(conn);
		} else if (Helpers.isString(config)) {
			connectionString = config;
		}

		return connectionString;
	}

	/**
	 * Transform the adapter's result into a standard format
	 *
	 * @param {*} result - original driver result object
	 * @return {Result} - standard result object
	 */
	transformResult (result) {
		if (result == null) {
			return new Result();
		}

		const cols = [];
		result.fields.forEach(field => {
			cols.push(field.name);
		});

		return new Result(result.rows, cols);
	}

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @return {void|Promise} - Returns a promise if no callback is provided
	 */
	execute (sql, params) {
		// Replace question marks with numbered placeholders, because this adapter is different...
		let count = 0;
		sql = sql.replace(/\?/g, () => {
			count++;
			return `$${count}`;
		});

		return this.instance.then(conn => {
			return new Promise((resolve, reject) => {
				conn.query(sql, params, (err, result) =>
					(err)
						? reject(err)
						: resolve(this.transformResult(result))
				);
			});
		});
	}
}

module.exports = Pg;
