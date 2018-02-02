/**
 * Class that wraps database connection libraries
 *
 * @private
 * @param  {Promise} instance - The connection object
 */
class Adapter {
	/**
	 * Invoke an adapter
	 *
	 * @constructor
	 * @param  {Promise} instance - Promise holding connection object
	 */
	constructor (instance) {
		this.instance = instance;
	}

	/**
	 * Run the sql query as a prepared statement
	 *
	 * @param {String} sql - The sql with placeholders
	 * @param {Array} params - The values to insert into the query
	 * @return {Promise} - returns a promise resolving to the result of the database query
	 */
	execute (sql, params) {
		throw new Error('Correct adapter not defined for query execution');
	}

	/**
	 * Transform the adapter's result into a standard format
	 *
	 * @param {*} originalResult - the original result object from the driver
	 * @return {Result} - the new result object
	 */
	transformResult (originalResult) {
		throw new Error('Result transformer method not defined for current adapter');
	}

	/**
	 * Close the current database connection
	 * @return {void}
	 */
	close () {
		this.instance.then(conn => conn.end());
	}
}

module.exports = Adapter;
