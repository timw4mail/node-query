'use strict';

const QueryBuilder = require('./QueryBuilder');

// Map config driver name to code class name
const dbDriverMap = new Map([
	['my', 'Mysql'],
	['mysql', 'Mysql'],
	['maria', 'Mysql'],
	['mariadb', 'Mysql'],
	['firebird', 'Firebird'],
	['postgresql', 'Pg'],
	['postgres', 'Pg'],
	['pg', 'Pg'],
	['sqlite3', 'Sqlite'],
	['sqlite', 'Sqlite']
]);

/**
 * Class for connection management
 *
 * @param {object} config - connection parameters
 */
class NodeQuery {
	/**
	 * Constructor
	 *
	 * @param {object} config - connection parameters
	 * @example let nodeQuery = require('ci-node-query')({
	 * 	driver: 'mysql',
	 * 	connection: {
	 * 		host: 'localhost',
	 * 		user: 'root',
	 * 		password: '',
	 * 		database: 'mysql'
	 * 	}
	 * });
	 * @example let nodeQuery = require('ci-node-query')({
	 * 	driver: 'sqlite',
	 * 	connection: ':memory:'
	 * });
	 */
	constructor (config) {
		this.instance = null;

		if (config != null) {
			let drivername = dbDriverMap.get(config.driver);

			if (!drivername) {
				throw new Error(`Selected driver (${config.driver}) does not exist!`);
			}

			const driver = require(`./drivers/${drivername}`);
			const Adapter = require(`./adapters/${drivername}`);

			let adapter = new Adapter(config.connection);
			this.instance = new QueryBuilder(driver, adapter);
		}
	}

	/**
	 * Return an existing query builder instance
	 *
	 * @return {QueryBuilder} - The Query Builder object
	 */
	getQuery () {
		if (this.instance == null) {
			throw new Error('No Query Builder instance to return');
		}

		return this.instance;
	}
}

module.exports = config => new NodeQuery(config);
