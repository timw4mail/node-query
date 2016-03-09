'use strict';

let fs = require('fs'),
	helpers = require('./helpers'),
	QueryBuilder = require('./QueryBuilder');

/**
 * Class for connection management
 */
class NodeQuery {

	/**
	 * Constructor
	 *
	 * @private
	 * @constructor
	 */
	constructor() {
		this.instance = null;
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

module.exports = new NodeQuery();