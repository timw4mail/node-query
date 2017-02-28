'use strict';

const Pg = require('./Pg');
const Result = require('../../Result');
const pg = require('pg').native;
const url = require('url');

class PgNative extends Pg {
	constructor (config) {
		super(config);
		let instance = null;
		let connectionString = Pg._formatConnectionString(config);

		if (connectionString !== '') {
			let conn = new pg.Client(connectionString);
			conn.connect(err => {
				if (err) {
					throw new Error(err);
				}
			});

			instance = Promise.resolve(conn);
		}
		super(instance);
	}
}

module.exports = PgNative;
