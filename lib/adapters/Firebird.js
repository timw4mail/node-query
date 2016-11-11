'use strict';

const Adapter = require('../Adapter');
const getArgs = require('getargs');
const fb = require('node-firebird');

class Firebird extends Adapter {

	constructor (config) {
		super({});
		this.instance = new Promise((resolve, reject) => {
			fb.attach(config, (err, instance) => {
				if (err) {
					return reject(err);
				}

				return resolve(instance)
			});
		});
	}

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @return {Promise} - Returns a promise if no callback is provided
	 */
	execute (sql, params) {
		return this.instance.then(conn => {
			return new Promise((resolve, reject) => {
				conn.query(args.sql. args.params, (err, result) => {
					if (err) {
						return reject(err);
					}

					return resolve(result);
				})
			});
		});
	}

	/**
	 * Close the current database connection
	 * @return {void}
	 */
	close () {
		this.instance.then(conn => conn.detach());
	}
}

module.exports = Firebird;