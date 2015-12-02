"use strict";

import helpers from '../helpers';
import Driver from '../DriverClass';

/**
 * Driver for Sqlite databases
 *
 * @module drivers/sqlite
 */
class Sqlite extends Driver {
	constructor() {
		super();
		this.hasTruncate = false;
	}

	insertBatch(table, data) {

		// Get the data values to insert, so they can
		// be parameterized
		let sql = "",
			vals = [],
			cols = [],
			fields = [],
			first = data.shift(),
			params = [],
			paramString = "",
			paramList = [];


		data.forEach((obj) => {
			let row = [];
			Object.keys(obj).forEach((key) => {
				row.push(obj[key]);
			});
			vals.push(row);
		});

		sql += "INSERT INTO " + this.quoteTable(table) + "\n";

		// Get the field names from the keys of the first
		// object to be inserted
		fields = Object.keys(first);
		Object.keys(first).forEach((key) => {
			cols.push("'" + this._quote(first[key]) + "' AS " + this.quoteIdentifiers(key));
		});

		sql += "SELECT " + cols.join(', ') + "\n";

		vals.forEach((row_values) => {
			let quoted = row_values.map((value) => {
				return String(value).replace("'", "'\'");
			});
			sql += "UNION ALL SELECT '" + quoted.join("', '") + "'\n";
		});

		return {
			sql: sql,
			values: null
		};
	}
};

module.exports = new Sqlite();