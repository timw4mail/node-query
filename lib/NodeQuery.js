'use strict';

const fs = require('fs');
const helpers = require('./helpers');
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
]);

/**
 * Class for connection management
 */
class NodeQuery {

	/**
	 * Constructor
	 *
	 * @param {object} config - connection paramaters
	 * @constructor
	 */
	constructor(config) {
		this.instance = null;

		if (config != null) {
			let drivername = dbDriverMap.get(config.driver);
			let driver = require(`./drivers/${drivername}`);
			let $adapter = require(`./adapters/${drivername}`);

			let adapter = new $adapter(config.connection);
			this.instance = new QueryBuilder(driver, adapter);
		}
	}

	/**
	 * Create a query builder object
	 *
	 * @param {String} driverType - The name of the database type, eg. mysql or pg
	 * @param {Object} connObject - A connection object from the database library
	 * you are connecting with
	 * @param {String} [connLib] - The name of the db connection library you are
	 * using, eg. mysql or mysql2. Optional if the same as driverType
	 * @return {QueryBuilder} - The Query Builder object
	 */
	init(driverType, connObject, connLib) {
		connLib = connLib || driverType;

		let paths = {
			driver: `${__dirname}/drivers/${helpers.upperCaseFirst(driverType)}`,
			adapter: `${__dirname}/adapters/${connLib}`,
		};

		Object.keys(paths).forEach(type => {
			try {
				fs.statSync(`${paths[type]}.js`);
			} catch (e) {
				throw new Error(
					`Selected ${type} (${helpers.upperCaseFirst(driverType)}) does not exist!`
				);
			}
		});

		let driver = require(paths.driver);
		let $adapter = require(paths.adapter);
		let adapter = new $adapter(connObject);

		this.instance = new QueryBuilder(driver, adapter);

		return this.instance;
	}

	/**
	 * Return an existing query builder instance
	 *
	 * @return {QueryBuilder} - The Query Builder object
	 */
	getQuery() {
		if (this.instance == null) {
			throw new Error('No Query Builder instance to return');
		}

		return this.instance;
	}
}

module.exports = (config => {
	return new NodeQuery(config);
});