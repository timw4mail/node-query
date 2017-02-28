'use strict';

const Helpers = require('./Helpers');

/**
 * Query result object
 *
 * @param {Array} rows - the data rows of the result
 * @param {Array} columns - the column names in the result
 */
class Result {
	/**
	 * Create a result object
	 *
	 * @private
	 * @param {Array} [rows] - the data rows of the result
	 * @param {Array} [columns] - the column names in the result
	 */
	constructor (rows=[], columns=[]) {
		this._rows = rows;
		this._columns = columns;

		// If columns aren't explicitly given,
		// get the list from the first row's keys
		if (
			this._columns.length === 0 &&
			this._rows.length > 0 &&
			Helpers.isObject(rows[0])
		) {
			this.columns = Object.keys(rows[0]);
		}
	}

	/**
	 * Return the result rows
	 *
	 * @private
	 * @return {Array} - the data rows of the result
	 */
	get rows () {
		return this._rows;
	}

	/**
	 * Set the result rows for the result object
	 *
	 * @private
	 * @param {Array} rows - the data rows of the result
	 * @return {void}
	 */
	set rows (rows) {
		this._rows = rows;
	}

	/**
	 * Return the result columns
	 *
	 * @private
	 * @return {Array} - the column names in the result
	 */
	get columns () {
		return this._columns;
	}

	/**
	 * Set the result columns for the result object
	 *
	 * @private
	 * @param {Array} cols - the array of columns for the current result
	 * @return {void}
	 */
	set columns (cols) {
		this._columns = cols;
	}

	/**
	 * Get the number of rows returned by the query
	 *
	 * @return {Number} - the number of rows in the result
	 */
	rowCount () {
		return this._rows.length;
	}

	/**
	 * Get the number of columns returned by the query
	 *
	 * @return {Number} - the number of columns in the result
	 */
	columnCount () {
		return this._columns.length;
	}
}

module.exports = Result;
