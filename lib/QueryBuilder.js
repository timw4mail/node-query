'use strict';

const getArgs = require('getargs');
const helpers = require('./helpers');
const QueryBuilderBase = require('./QueryBuilderBase');

/**
 * Main object that builds SQL queries.
 *
 * @param {Driver} Driver - The syntax driver for the database
 * @param {Adapter} Adapter - The database module adapter for running queries
 * @extends QueryBuilderBase
 */
class QueryBuilder extends QueryBuilderBase {
	// ----------------------------------------------------------------------------
	// ! Miscellaneous Methods
	// ----------------------------------------------------------------------------

	/**
	 * Run an arbitrary sql query. Run as a prepared statement.
	 *
	 * @param {string} sql - The sql to execute
	 * @param {array} [params] - The query parameters
	 * @param {function} [callback] - Optional callback
	 * @return {Promise} - Returns a promise if no callback is supplied
	 */
	query (string, params) {
		return this.adapter.execute(string, params);
	}

	/**
	 * Reset the object state for a new query
	 *
	 * @return {void}
	 */
	resetQuery () {
		this._resetState();
	}

	/**
	 * Returns the current class state for testing or other purposes
	 *
	 * @private
	 * @return {Object} - The State object
	 */
	getState () {
		return this.state;
	}

	/**
	 * Empties the selected database table
	 *
	 * @param {string} table - the name of the table to truncate
	 * @param {function} [callback] - Optional callback
	 * @return {void|Promise} - Returns a promise if no callback is supplied
	 */
	truncate (/* table:string, [callback]:function */) {
		getArgs('table:string, [callback]:function', arguments);
		let args = [].slice.apply(arguments);
		let sql = this.driver.truncate(args.shift());
		args.unshift(sql);
		return this.query.apply(this, args);
	}

	/**
	 * Closes the database connection for the current adapter
	 *
	 * @return {void}
	 */
	end () {
		this.adapter.close();
	}

	// ------------------------------------------------------------------------
	// ! Query Builder Methods
	// ------------------------------------------------------------------------

	/**
	 * Specify rows to select in the query
	 *
	 * @param {String|Array} fields - The fields to select from the current table
	 * @example query.select('foo, bar'); // Select multiple fields with a string
	 * @example query.select(['foo', 'bar']); // Select multiple fileds with an array
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	select (fields) {
		// Split/trim fields by comma
		fields = (Array.isArray(fields))
			? fields
			: fields.split(',').map(helpers.stringTrim);

		// Split on 'As'
		fields.forEach((field, index) => {
			if (field.match(/as/i)) {
				fields[index] = field.split(/ as /i).map(helpers.stringTrim);
			}
		});

		let safeArray = this.driver.quoteIdentifiers(fields);

		// Join the strings back together
		safeArray.forEach((field, index) => {
			if (Array.isArray(field)) {
				safeArray[index] = safeArray[index].join(' AS ');
			}
		});

		this.state.selectString += safeArray.join(', ');

		return this;
	}

	/**
	 * Specify the database table to select from
	 *
	 * @param {String} tableName - The table to use for the current query
	 * @example query.from('tableName');
	 * @example query.from('tableName t'); // Select the table with an alias
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	from (tableName) {
		// Split identifiers on spaces
		let identArray = tableName.trim().split(' ').map(helpers.stringTrim);

		// Quote/prefix identifiers
		identArray[0] = this.driver.quoteTable(identArray[0]);
		identArray = this.driver.quoteIdentifiers(identArray);

		// Put it back together
		this.state.fromString = identArray.join(' ');

		return this;
	}

	/**
	 * Add a 'like/ and like' clause to the query
	 *
	 * @param {String} field - The name of the field  to compare to
	 * @param {String} val - The value to compare to
	 * @param {String} [pos=both] - The placement of the wildcard character(s): before, after, or both
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	like (field, val, pos) {
		this._like(field, val, pos, ' LIKE ', 'AND');
		return this;
	}

	/**
	 * Add a 'not like/ and not like' clause to the query
	 *
	 * @param {String} field - The name of the field  to compare to
	 * @param {String} val - The value to compare to
	 * @param {String} [pos=both] - The placement of the wildcard character(s): before, after, or both
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	notLike (field, val, pos) {
		this._like(field, val, pos, ' NOT LIKE ', 'AND');
		return this;
	}

	/**
	 * Add an 'or like' clause to the query
	 *
	 * @param {String} field - The name of the field  to compare to
	 * @param {String} val - The value to compare to
	 * @param {String} [pos=both] - The placement of the wildcard character(s): before, after, or both
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	orLike (field, val, pos) {
		this._like(field, val, pos, ' LIKE ', 'OR');
		return this;
	}

	/**
	 * Add an 'or not like' clause to the query
	 *
	 * @param {String} field - The name of the field  to compare to
	 * @param {String} val - The value to compare to
	 * @param {String} [pos=both] - The placement of the wildcard character(s): before, after, or both
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	orNotLike (field, val, pos) {
		this._like(field, val, pos, ' NOT LIKE ', 'OR');
		return this;
	}

	/**
	 * Add a 'having' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	having (/* key, [val] */) {
		let args = getArgs('key:string|object, [val]:string|number', arguments);

		this._having(args.key, args.val, 'AND');
		return this;
	}

	/**
	 * Add an 'or having' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	orHaving (/* key, [val] */) {
		let args = getArgs('key:string|object, [val]:string|number', arguments);

		this._having(args.key, args.val, 'OR');
		return this;
	}

	/**
	 * Set a 'where' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	where (key, val) {
		this._where(key, val, 'AND');
		return this;
	}

	/**
	 * Set a 'or where' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	orWhere (key, val) {
		this._where(key, val, 'OR');
		return this;
	}

	/**
	 * Select a field that is Null
	 *
	 * @param {String} field - The name of the field that has a NULL value
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	whereIsNull (field) {
		this._whereNull(field, 'IS NULL', 'AND');
		return this;
	}

	/**
	 * Specify that a field IS NOT NULL
	 *
	 * @param {String} field - The name so the field that is not to be null
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	whereIsNotNull (field) {
		this._whereNull(field, 'IS NOT NULL', 'AND');
		return this;
	}

	/**
	 * Field is null prefixed with 'OR'
	 *
	 * @param {String} field - The name of the field
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	orWhereIsNull (field) {
		this._whereNull(field, 'IS NULL', 'OR');
		return this;
	}

	/**
	 * Field is not null prefixed with 'OR'
	 *
	 * @param {String} field - The name of the field
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	orWhereIsNotNull (field) {
		this._whereNull(field, 'IS NOT NULL', 'OR');
		return this;
	}

	/**
	 * Set a 'where in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} values - the array of items to search in
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	whereIn (key, values) {
		this._whereIn(key, values, 'IN', 'AND');
		return this;
	}

	/**
	 * Set a 'or where in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} values - the array of items to search in
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	orWhereIn (key, values) {
		this._whereIn(key, values, 'IN', 'OR');
		return this;
	}

	/**
	 * Set a 'where not in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} values - the array of items to search in
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	whereNotIn (key, values) {
		this._whereIn(key, values, 'NOT IN', 'AND');
		return this;
	}

	/**
	 * Set a 'or where not in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} values - the array of items to search in
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	orWhereNotIn (key, values) {
		this._whereIn(key, values, 'NOT IN', 'OR');
		return this;
	}

	/**
	 * Set values for insertion or updating
	 *
	 * @param {String|Object} key - The key or object to use
	 * @param {String} [val] - The value if using a scalar key
	 * @example query.set('foo', 'bar'); // Set a key, value pair
	 * @example query.set({foo:'bar'}); // Set with an object
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	set (/* $key, [$val] */) {
		let args = getArgs('$key, [$val]', arguments);

		// Set the appropriate state variables
		this._mixedSet('setArrayKeys', 'key', args.$key, args.$val);
		this._mixedSet('values', 'value', args.$key, args.$val);

		// Use the keys of the array to make the insert/update string
		// and escape the field names
		this.state.setArrayKeys = this.state.setArrayKeys.map(this.driver._quote);

		// Generate the "set" string
		this.state.setString = this.state.setArrayKeys.join('=?,');
		this.state.setString += '=?';

		return this;
	}

	/**
	 * Add a join clause to the query
	 *
	 * @param {String} table - The table you are joining
	 * @param {String} cond - The join condition.
	 * @param {String} [type='inner'] - The type of join, which defaults to inner
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	join (table, cond, type) {
		type = type || 'inner';

		// Prefix/quote table name
		table = table.split(' ').map(helpers.stringTrim);
		table[0] = this.driver.quoteTable(table[0]);
		table = table.map(this.driver.quoteIdentifiers);
		table = table.join(' ');

		// Parse out the join condition
		let parsedCondition = this.parser.compileJoin(cond);
		let condition = `${table} ON ${parsedCondition}`;

		// Append the join condition to the query map
		this._appendMap(`\n${type.toUpperCase()} JOIN `, condition, 'join');

		return this;
	}

	/**
	 * Group the results by the selected field(s)
	 *
	 * @param {String|Array} field - The name of the field to group by
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	groupBy (field) {
		if (!helpers.isScalar(field)) {
			let newGroupArray = field.map(this.driver.quoteIdentifiers);
			this.state.groupArray = this.state.groupArray.concat(newGroupArray);
		} else {
			this.state.groupArray.push(this.driver.quoteIdentifiers(field));
		}

		this.state.groupString = ` GROUP BY ${this.state.groupArray.join(',')}`;

		return this;
	}

	/**
	 * Order the results by the selected field(s)
	 *
	 * @param {String} field - The field(s) to order by
	 * @param {String} [type='ASC'] - The order direction, ASC or DESC
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	orderBy (field, type) {
		type = type || 'ASC';

		// Set the fields for later manipulation
		field = this.driver.quoteIdentifiers(field);

		this.state.orderArray[field] = type;

		let orderClauses = [];

		// Flatten key/val pairs into an array of space-separated pairs
		Object.keys(this.state.orderArray).forEach(key => {
			orderClauses.push(`${key} ${this.state.orderArray[key].toUpperCase()}`);
		});

		// Set the final string
		this.state.orderString = ` ORDER BY ${orderClauses.join(', ')}`;

		return this;
	}

	/**
	 * Put a limit on the query
	 *
	 * @param {Number} limit - The maximum number of rows to fetch
	 * @param {Number} [offset] - The row number to start from
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	limit (limit, offset) {
		this.state.limit = limit;
		this.state.offset = offset || null;

		return this;
	}

	/**
	 * Adds an open paren to the current query for logical grouping
	 *
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	groupStart () {
		let conj = (this.state.queryMap.length < 1) ? ' WHERE ' : ' AND ';
		this._appendMap(conj, '(', 'groupStart');

		return this;
	}

	/**
	 * Adds an open paren to the current query for logical grouping,
	 * prefixed with 'OR'
	 *
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	orGroupStart () {
		this._appendMap('', ' OR (', 'groupStart');

		return this;
	}

	/**
	 * Adds an open paren to the current query for logical grouping,
	 * prefixed with 'OR NOT'
	 *
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	orNotGroupStart () {
		this._appendMap('', ' OR NOT (', 'groupStart');

		return this;
	}

	/**
	 * Ends a logical grouping started with one of the groupStart methods
	 *
	 * @return {QueryBuilder} - The Query Builder object, for chaining
	 */
	groupEnd () {
		this._appendMap('', ')', 'groupEnd');

		return this;
	}

	// ------------------------------------------------------------------------
	// ! Result Methods
	// ------------------------------------------------------------------------

	/**
	 * Get the results of the compiled query
	 *
	 * @param {String} [table] - The table to select from
	 * @param {Number} [limit] - A limit for the query
	 * @param {Number} [offset] - An offset for the query
	 * @param {Function} [callback] - A callback for receiving the result
	 * @example query.get('table_name').then(promiseCallback); // Get all the rows in the table
	 * @example query.get('table_name', 5, callback); // Get 5 rows from the table
	 * @example query.get(callback); // Get the results of a query generated with other methods
	 * @return {void|Promise} - If no callback is passed, a promise is returned
	 */
	get (/* [table], [limit], [offset], [callback] */) {
		const argPattern = '[table]:string, [limit]:number, [offset]:number, [callback]:function';
		let args = getArgs(argPattern, arguments);

		if (args.table) {
			this.from(args.table);
		}

		if (args.limit) {
			this.limit(args.limit, args.offset);
		}

		// Run the query
		return this._run('get', args.table, args.callback);
	}

	/**
	 * Run the generated insert query
	 *
	 * @param {String} table - The table to insert into
	 * @param {Object} [data] - Data to insert, if not already added with the 'set' method
	 * @param {Function} [callback] - Callback for handling response from the database
	 * @return {void|Promise} - If no callback is passed, a promise is returned
	 */
	insert (/* table, data, callback */) {
		let args = getArgs('table:string, [data]:object, [callback]:function', arguments);

		if (args.data) {
			this.set(args.data);
		}

		// Run the query
		return this._run('insert', this.driver.quoteTable(args.table), args.callback);
	}

	/**
	 * Insert multiple sets of rows at a time
	 *
	 * @param {String} table - The table to insert into
	 * @param {Array} data - The array of objects containing data rows to insert
	 * @param {Function} [callback] - Callback for handling database response
	 * @example query.insertBatch('foo',[{id:1,val:'bar'},{id:2,val:'baz'}], callbackFunction);
	 * @example query.insertBatch('foo',[{id:1,val:'bar'},{id:2,val:'baz'}])
	 *.then(promiseCallback);
	 * @return {void|Promise} - If no callback is passed, a promise is returned
	 */
	insertBatch (/* table, data, callback */) {
		let args = getArgs('table:string, data:array, [callback]:function', arguments);
		let batch = this.driver.insertBatch(args.table, args.data);

		// Run the query
		return this._run('', '', args.callback, batch.sql, batch.values);
	}

	/**
	 * Run the generated update query
	 *
	 * @param {String} table - The table to insert into
	 * @param {Object} [data] - Data to insert, if not already added with the 'set' method
	 * @param {Function} [callback] - Callback for handling response from the database
	 * @return {void|Promise} - If no callback is passed, a promise is returned
	 */
	update (/* table, data, callback */) {
		let args = getArgs('table:string, [data]:object, [callback]:function', arguments);

		if (args.data) {
			this.set(args.data);
		}

		// Run the query
		return this._run('update', this.driver.quoteTable(args.table), args.callback);
	}

	/**
	 * Run the generated delete query
	 *
	 * @param {String} table - The table to insert into
	 * @param {Object} [where] - Where clause for delete statement
	 * @param {Function} [callback] - Callback for handling response from the database
	 * @return {void|Promise} - If no callback is passed, a promise is returned
	 */
	delete (/* table, [where], [callback] */) {
		let args = getArgs('table:string, [where]:object, [callback]:function', arguments);

		if (args.where) {
			this.where(args.where);
		}

		// Run the query
		return this._run('delete', this.driver.quoteTable(args.table), args.callback);
	}

	// ------------------------------------------------------------------------
	// ! Methods returning SQL
	// ------------------------------------------------------------------------

	/**
	 * Return generated select query SQL
	 *
	 * @param {String} [table] - the name of the table to retrieve from
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return {String} - The compiled sql statement
	 */
	getCompiledSelect (/* table, reset */) {
		let args = getArgs('[table]:string, [reset]:boolean', arguments);
		if (args.table) {
			this.from(args.table);
		}

		return this._getCompile('get', args.table, args.reset);
	}

	/**
	 * Return generated insert query SQL
	 *
	 * @param {String} table - the name of the table to insert into
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return {String} - The compiled sql statement
	 */
	getCompiledInsert (table, reset) {
		return this._getCompile('insert', this.driver.quoteTable(table), reset);
	}

	/**
	 * Return generated update query SQL
	 *
	 * @param {String} table - the name of the table to update
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return {String} - The compiled sql statement
	 */
	getCompiledUpdate (table, reset) {
		return this._getCompile('update', this.driver.quoteTable(table), reset);
	}

	/**
	 * Return generated delete query SQL
	 *
	 * @param {String} table - the name of the table to delete from
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return {String} - The compiled sql statement
	 */
	getCompiledDelete (table, reset) {
		return this._getCompile('delete', this.driver.quoteTable(table), reset);
	}
}

module.exports = QueryBuilder;
