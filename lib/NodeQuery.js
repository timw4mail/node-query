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
	['sqlite', 'Sqlite'],
	['sqlserver', 'MSSQLServer'],
	['mssql', 'MSSQLServer']
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
	 * @param {string} config.driver - the database driver to use, such as mysql, sqlite, mssql, or pgsql
	 * @param {object|string} config.connection - the connection options for the database
	 * @param {string} config.connection.host - the ip or hostname of the database server
	 * @param {string} config.connection.user - the user to log in as
	 * @param {string} config.connection.password - the password to log in with
	 * @param {string} config.connection.database - the name of the database to connect to
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

		if (config !== undefined) {
			let drivername = dbDriverMap.get(config.driver);

			if (!drivername) {
				throw new Error(`Selected driver (${config.driver}) does not exist!`);
			}

			const driver = require(`./drivers/${drivername}`);
			const Adapter = require(`./adapters/${drivername}`);

			let adapter = Adapter(config);
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
