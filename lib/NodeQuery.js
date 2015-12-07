"use strict";

let instance = null;
let fs = require('fs'),
	helpers = require('./helpers'),
	QueryBuilder = require('./QueryBuilder');

/**
 * @module NodeQuery
 */
class NodeQuery {

	/**
	 * Constructor
	 *
	 * @return {void}
	 */
	constructor() {
		this.instance = null;
	}

	/**
	 * Create a query builder object
	 *
	 * @memberOf NodeQuery
	 * @param {String} driverType - The name of the database type, eg. mysql or pg
	 * @param {Object} connObject - A connection object from the database library you are connecting with
	 * @param {String} [connLib] - The name of the db connection library you are using, eg. mysql or mysql2. Optional if the same as drivername
	 * @return {QueryBuilder} - The Query Builder object
	 */
	init(driverType, connObject, connLib) {
		connLib = connLib || driverType;

		let paths = {
			driver: `${__dirname}/drivers/` + helpers.upperCaseFirst(driverType),
			adapter: `${__dirname}/adapters/${connLib}`
		};

		Object.keys(paths).forEach(type => {
			if ( ! fs.existsSync(paths[type]))
			{
				throw new Error(
					`Selected ${type} (` +
					helpers.upperCaseFirst(driverType) +
					`) does not exist!`
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
		if ( ! this.instance) {
			throw new Error("No Query Builder instance to return");
		}

		return this.instance;
	}

}

module.exports = new NodeQuery();