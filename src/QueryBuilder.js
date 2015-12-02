'use strict';

/** @module QueryBuilder */
import getArgs from 'getargs';
import helpers from './helpers';
import State from './State';
import QueryParser from './QueryParser';

module.exports = class QueryBuilder {
	/*
	 * SQL generation object
	 *
	 * @param {driver} - The syntax driver for the database
	 * @param {adapter} - The database module adapter for running queries
	 * @returns {QueryBuilder}
	 * @constructor
	 */
	constructor(driver, adapter) {
		this.driver = driver;
		this.adapter = adapter;
		this.parser = new QueryParser(this.driver);
		this.state = new State();
	}

	/**
	 * Complete the sql building based on the type provided
	 *
	 * @param {String} type
	 * @param {String} table
	 * @private
	 * @return {String}
	 */
	_compile(type, table) {
		// Put together the basic query
		let sql = this._compileType(type, table);

		// Set each subClause
		['queryMap', 'groupString', 'orderString', 'havingMap'].forEach((clause) => {
			let param = this.state[clause];

			if ( ! helpers.isScalar(param))
			{
				Object.keys(param).forEach((part) => {
					sql += param[part].conjunction + param[part].string;
				});
			}
			else
			{
				sql += param;
			}
		});

		// Append the limit, if it exists
		if (helpers.isNumber(this.state.limit))
		{
			sql = this.driver.limit(sql, this.state.limit, this.state.offset);
		}

		return sql;
	}

	_compileType(type, table) {
		let sql = '';

		switch(type) {
			case "insert":
				let params = Array(this.state.setArrayKeys.length).fill('?');

				sql = `INSERT INTO ${table} (`;
				sql += this.state.setArrayKeys.join(',');
				sql += ") VALUES (";
				sql += params.join(',') + ')';
			break;

			case "update":
				sql = `UPDATE ${table} SET ${this.state.setString}`;
			break;

			case "delete":
				sql = `DELETE FROM ${table}`;
			break;

			default:
				sql = `SELECT * FROM ${this.state.fromString}`;

				// Set the select string
				if (this.state.selectString.length > 0)
				{
					// Replace the star with the selected fields
					sql = sql.replace('*', this.state.selectString);
				}
			break;
		}

		return sql;
	}

	_like(field, val, pos, like, conj) {
		field = this.driver.quoteIdentifiers(field);

		like = `${field} ${like} ?`;

		if (pos == 'before')
		{
			val = `%${val}`;
		}
		else if (pos == 'after')
		{
			val = `${val}%`;
		}
		else
		{
			val = `%${val}%`;
		}

		conj = (this.state.queryMap.length < 1) ? ' WHERE ' : ` ${conj} `;
		this._appendMap(conj, like, 'like');

		this.state.whereValues.push(val);
	}

	/**
	 * Append a clause to the query map
	 *
	 * @param {String} conjunction
	 * @param {String} string
	 * @param {String} type
	 * @return {void}
	 */
	_appendMap(conjunction, string, type) {
		this.state.queryMap.push({
			type: type,
			conjunction: conjunction,
			string: string
		});
	}

	/**
	 * Handle key/value pairs in an object the same way as individual arguments,
	 * when appending to state
	 *
	 * @private
	 */
	_mixedSet(/* $letName, $valType, $key, [$val] */) {
		let args = getArgs('$letName:string, $valType:string, $key:object|string|number, [$val]', arguments);

		let obj = {};


		if (helpers.isScalar(args.$key) && !helpers.isUndefined(args.$val))
		{
			// Convert key/val pair to a simple object
			obj[args.$key] = args.$val;
		}
		else if (helpers.isScalar(args.$key) && helpers.isUndefined(args.$val))
		{
			// If just a string for the key, and no value, create a simple object with duplicate key/val
			obj[args.$key] = args.$key;
		}
		else
		{
			obj = args.$key;
		}

		Object.keys(obj).forEach((k) => {
			// If a single value for the return
			if (['key','value'].indexOf(args.$valType) !== -1)
			{
				let pushVal = (args.$valType === 'key') ? k : obj[k];
				this.state[args.$letName].push(pushVal);
			}
			else
			{
				this.state[args.$letName][k] = obj[k];
			}
		});


		return this.state[args.$letName];
	}

	_whereMixedSet(/*key, val*/) {
		let args = getArgs('key:string|object, [val]', arguments);

		this.state.whereMap = [];
		this.state.rawWhereValues = [];

		this._mixedSet('whereMap', 'both', args.key, args.val);
		this._mixedSet('rawWhereValues', 'value', args.key, args.val);
	}

	_fixConjunction(conj) {
		let lastItem = this.state.queryMap[this.state.queryMap.length - 1];
		let conjunctionList = helpers.arrayPluck(this.state.queryMap, 'conjunction');

		if (this.state.queryMap.length === 0 || ( ! helpers.regexInArray(conjunctionList, /^ ?WHERE/i)))
		{
			conj = " WHERE ";
		}
		else if (lastItem.type === 'groupStart')
		{
			conj = '';
		}
		else
		{
			conj = ' ' + conj + ' ';
		}

		return conj;
	}

	_where(key, val, defaultConj) {
		// Normalize key and value and insert into this.state.whereMap
		this._whereMixedSet(key, val);

		// Parse the where condition to account for operators,
		// functions, identifiers, and literal values
		this.state = this.parser.parseWhere(this.driver, this.state);

		this.state.whereMap.forEach((clause) => {
			let conj = this._fixConjunction(defaultConj);
			this._appendMap(conj, clause, 'where');
		});

		this.state.whereMap = {};
	}

	_whereNull(field, stmt, conj) {
		field = this.driver.quoteIdentifiers(field);
		let item = field + ' ' + stmt;

		this._appendMap(this._fixConjunction(conj), item, 'whereNull');
	}

	_having(/*key, val, conj*/) {
		let args = getArgs('key:string|object, [val]:string|number, [conj]:string', arguments);
		args.conj = args.conj || 'AND';
		args.val = args.val || null;

		// Normalize key/val and put in state.whereMap
		this._whereMixedSet(args.key, args.val);

		// Parse the having condition to account for operators,
		// functions, identifiers, and literal values
		this.state = this.parser.parseWhere(this.driver, this.state);

		this.state.whereMap.forEach((clause) => {
			// Put in the having map
			this.state.havingMap.push({
				conjunction: (this.state.havingMap.length > 0) ? ` ${args.conj} ` : ' HAVING ',
				string: clause
			});
		});

		// Clear the where Map
		this.state.whereMap = {};
	}
	_whereIn(/*key, val, inClause, conj*/) {
		let args = getArgs('key:string, val:array, inClause:string, conj:string', arguments);

		args.key = this.driver.quoteIdentifiers(args.key);
		let params = new Array(args.val.length);
		params.fill('?');

		args.val.forEach((value) => {
			this.state.whereValues.push(value);
		});

		args.conj = (this.state.queryMap.length > 0) ? " " + args.conj + " " : ' WHERE ';
		let str = args.key + " " + args.inClause + " (" + params.join(',') + ") ";

		this._appendMap(args.conj, str, 'whereIn');
	}

	_run(type, table, callback, sql, vals) {

		if ( ! sql)
		{
			sql = this._compile(type, table);
		}

		if ( ! vals)
		{
			vals = this.state.values.concat(this.state.whereValues);
		}

//console.log(this.state);
//console.log(sql);
//console.log(vals);
//console.log(callback);
//console.log('------------------------');

		// Reset the state so another query can be built
		this._resetState();

		// Pass the sql and values to the adapter to run on the database
		this.adapter.execute(sql, vals, callback);

	}

	_getCompile(type, table, reset) {
		reset = reset || false;

		let sql = this._compile(type, table);

		if (reset) this._resetState();

		return sql;
	}

	_resetState() {
		this.state = new State();
	}

	// ----------------------------------------------------------------------------
	// ! Miscellaneous Methods
	// ----------------------------------------------------------------------------

	/**
	 * Reset the object state for a new query
	 *
	 * @memberOf QueryBuilder
	 * @return {void}
	 */
	resetQuery() {
		this._resetState();
	}

	/**
	 * Returns the current class state for testing or other purposes
	 *
	 * @private
	 * @return {Object}
	 */
	getState() {
		return this.state;
	}

	/**
	 * Closes the database connection for the current adapter
	 *
	 * @return {void}
	 */
	end() {
		this.adapter.close();
	}

	// ------------------------------------------------------------------------
	// ! Query Builder Methods
	// ------------------------------------------------------------------------

	/**
	 * Specify rows to select in the query
	 *
	 * @memberOf QueryBuilder
	 * @param {String|Array} fields - The fields to select from the current table
	 * @return {QueryBuilder}
	 */
	select(fields) {

		// Split/trim fields by comma
		fields = (Array.isArray(fields))
			? fields
			: fields.split(",").map(helpers.stringTrim);

		// Split on 'As'
		fields.forEach((field, index) => {
			if (field.match(/as/i))
			{
				fields[index] = field.split(/ as /i).map(helpers.stringTrim);
			}
		});

		let safeArray = this.driver.quoteIdentifiers(fields);

		// Join the strings back together
		safeArray.forEach((field, index) => {
			if (Array.isArray(field))
			{
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
	 * @return {QueryBuilder}
	 */
	from(tableName) {
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
	 * @return {QueryBuilder}
	 */
	like(field, val, pos) {
		this._like(field, val, pos, ' LIKE ', 'AND');
		return this;
	}

	/**
	 * Add a 'not like/ and not like' clause to the query
	 *
	 * @param {String} field - The name of the field  to compare to
	 * @param {String} val - The value to compare to
	 * @param {String} [pos=both] - The placement of the wildcard character(s): before, after, or both
	 * @return {QueryBuilder}
	 */
	notLike(field, val, pos) {
		this._like(field, val, pos, ' NOT LIKE ', 'AND');
		return this;
	}

	/**
	 * Add an 'or like' clause to the query
	 *
	 * @param {String} field - The name of the field  to compare to
	 * @param {String} val - The value to compare to
	 * @param {String} [pos=both] - The placement of the wildcard character(s): before, after, or both
	 * @return {QueryBuilder}
	 */
	orLike(field, val, pos) {
		this._like(field, val, pos, ' LIKE ', 'OR');
		return this;
	}

	/**
	 * Add an 'or not like' clause to the query
	 *
	 * @param {String} field - The name of the field  to compare to
	 * @param {String} val - The value to compare to
	 * @param {String} [pos=both] - The placement of the wildcard character(s): before, after, or both
	 * @return {QueryBuilder}
	 */
	orNotLike(field, val, pos) {
		this._like(field, val, pos, ' NOT LIKE ', 'OR');
		return this;
	}

	/**
	 * Add a 'having' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return {QueryBuilder}
	 */
	having(/*key, [val]*/) {
		let args = getArgs('key:string|object, [val]:string|number', arguments);

		this._having(args.key, args.val, 'AND');
		return this;
	}

	/**
	 * Add an 'or having' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return {QueryBuilder}
	 */
	orHaving(/*key, [val]*/) {
		let args = getArgs('key:string|object, [val]:string|number', arguments);

		this._having(args.key, args.val, 'OR');
		return this;
	}

	/**
	 * Set a 'where' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return {QueryBuilder}
	 */
	where(key, val) {
		this._where(key, val, 'AND');
		return this;
	}

	/**
	 * Set a 'or where' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return {QueryBuilder}
	 */
	orWhere(key, val) {
		this._where(key, val, 'OR');
		return this;
	}

	/**
	 * Select a field that is Null
	 *
	 * @param {String} field - The name of the field that has a NULL value
	 * @return {QueryBuilder}
	 */
	whereIsNull(field) {
		this._whereNull(field, 'IS NULL', 'AND');
		return this;
	}

	/**
	 * Specify that a field IS NOT NULL
	 *
	 * @param {String} field
	 * @return {QueryBuilder}
	 */
	whereIsNotNull(field) {
		this._whereNull(field, 'IS NOT NULL', 'AND');
		return this;
	}

	/**
	 * Field is null prefixed with 'OR'
	 *
	 * @param {String} field
	 * @return {QueryBuilder}
	 */
	orWhereIsNull(field) {
		this._whereNull(field, 'IS NULL', 'OR');
		return this;
	}

	/**
	 * Field is not null prefixed with 'OR'
	 *
	 * @param {String} field
	 * @return {QueryBuilder}
	 */
	orWhereIsNotNull(field) {
		this._whereNull(field, 'IS NOT NULL', 'OR');
		return this;
	}

	/**
	 * Set a 'where in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} val - the array of items to search in
	 * @return {QueryBuilder}
	 */
	whereIn(key, val) {
		this._whereIn(key, val, 'IN', 'AND');
		return this;
	}

	/**
	 * Set a 'or where in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} val - the array of items to search in
	 * @return {QueryBuilder}
	 */
	orWhereIn(key, val) {
		this._whereIn(key, val, 'IN', 'OR');
		return this;
	}

	/**
	 * Set a 'where not in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} val - the array of items to search in
	 * @return {QueryBuilder}
	 */
	whereNotIn(key, val) {
		this._whereIn(key, val, 'NOT IN', 'AND');
		return this;
	}

	/**
	 * Set a 'or where not in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} val - the array of items to search in
	 * @return {QueryBuilder}
	 */
	orWhereNotIn(key, val) {
		this._whereIn(key, val, 'NOT IN', 'OR');
		return this;
	}

	/**
	 * Set values for insertion or updating
	 *
	 * @param {String|Object} key - The key or object to use
	 * @param {String} [val] - The value if using a scalar key
	 * @return {QueryBuilder}
	 */
	set(/* $key, [$val] */) {
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
	 * @return {QueryBuilder}
	 */
	join(table, cond, type) {
		type = type || "inner";

		// Prefix/quote table name
		table = table.split(' ').map(helpers.stringTrim);
		table[0] = this.driver.quoteTable(table[0]);
		table = table.map(this.driver.quoteIdentifiers);
		table = table.join(' ');

		// Parse out the join condition
		let parsedCondition = this.parser.compileJoin(cond);
		let condition = table + ' ON ' + parsedCondition;

		// Append the join condition to the query map
		this._appendMap("\n" + type.toUpperCase() + ' JOIN ', condition, 'join');

		return this;
	}

	/**
	 * Group the results by the selected field(s)
	 *
	 * @param {String|Array} field
	 * @return {QueryBuilder}
	 */
	groupBy(field) {
		if ( ! helpers.isScalar(field))
		{
			let newGroupArray = field.map(this.driver.quoteIdentifiers);
			this.state.groupArray = this.state.groupArray.concat(newGroupArray);
		}
		else
		{
			this.state.groupArray.push(this.driver.quoteIdentifiers(field));
		}

		this.state.groupString = ' GROUP BY ' + this.state.groupArray.join(',');

		return this;
	}

	/**
	 * Order the results by the selected field(s)
	 *
	 * @param {String} field - The field(s) to order by
	 * @param {String} [type='ASC'] - The order direction, ASC or DESC
	 * @return {QueryBuilder}
	 */
	orderBy(field, type) {
		type = type || 'ASC';

		// Set the fields for later manipulation
		field = this.driver.quoteIdentifiers(field);

		this.state.orderArray[field] = type;

		let orderClauses = [];

		// Flatten key/val pairs into an array of space-separated pairs
		Object.keys(this.state.orderArray).forEach((key) => {
			orderClauses.push(key + ' ' + this.state.orderArray[key].toUpperCase());
		});

		// Set the final string
		this.state.orderString = ' ORDER BY ' + orderClauses.join(', ');

		return this;
	}

	/**
	 * Put a limit on the query
	 *
	 * @param {Number} limit - The maximum number of rows to fetch
	 * @param {Number} [offset] - The row number to start from
	 * @return {QueryBuilder}
	 */
	limit(limit, offset) {
		this.state.limit = limit;
		this.state.offset = offset || null;

		return this;
	}

	/**
	 * Adds an open paren to the current query for logical grouping
	 *
	 * @return {QueryBuilder}
	 */
	groupStart() {
		let conj = (this.state.queryMap.length < 1) ? ' WHERE ' : ' AND ';
		this._appendMap(conj, '(', 'groupStart');

		return this;
	}

	/**
	 * Adds an open paren to the current query for logical grouping,
	 * prefixed with 'OR'
	 *
	 * @return {QueryBuilder}
	 */
	orGroupStart() {
		this._appendMap('', ' OR (', 'groupStart');

		return this;
	}

	/**
	 * Adds an open paren to the current query for logical grouping,
	 * prefixed with 'OR NOT'
	 *
	 * @return {QueryBuilder}
	 */
	orNotGroupStart() {
		this._appendMap('', ' OR NOT (', 'groupStart');

		return this;
	}

	/**
	 * Ends a logical grouping started with one of the groupStart methods
	 *
	 * @return {QueryBuilder}
	 */
	groupEnd() {
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
	 * @param {Function} callback - A callback for receiving the result
	 * @return {void}
	 */
	get(/* [table], [limit], [offset], callback */) {
		let args = getArgs('[table]:string, [limit]:number, [offset]:number, callback:function', arguments);

		if (args.table) {
			this.from(args.table);
		}

		if (args.limit) {
			this.limit(args.limit, args.offset);
		}

		// Run the query
		this._run('get', args.table, args.callback);
	}

	/**
	 * Run the generated insert query
	 *
	 * @param {String} table - The table to insert into
	 * @param {Object} [data] - Data to insert, if not already added with the 'set' method
	 * @param {Function} callback - Callback for handling response from the database
	 * @return {void}
	 */
	insert(/* table, data, callback */) {
		let args = getArgs('table:string, [data]:object, callback:function', arguments);

		if (args.data) {
			this.set(args.data);
		}

		// Run the query
		this._run('insert', this.driver.quoteTable(args.table), args.callback);
	}

	/**
	 * Insert multiple sets of rows at a time
	 *
	 * @param {String} table - The table to insert into
	 * @param {Array} data - The array of objects containing data rows to insert
	 * @param {Function} callback - Callback for handling database response
	 * @example query.insertBatch('foo',[{id:1,val:'bar'},{id:2,val:'baz'}], callbackFunction);
	 * @return {void}
	 */
	insertBatch(/* table, data, callback */) {
		let args = getArgs('table:string, data:array, callback:function', arguments);
		let batch = this.driver.insertBatch(args.table, args.data);

		// Run the query
		this._run('', '', args.callback, batch.sql, batch.values);
	}

	/**
	 * Run the generated update query
	 *
	 * @param {String} table - The table to insert into
	 * @param {Object} [data] - Data to insert, if not already added with the 'set' method
	 * @param {Function} callback - Callback for handling response from the database
	 * @return {void}
	 */
	update(/*table, data, callback*/) {
		let args = getArgs('table:string, [data]:object, callback:function', arguments);

		if (args.data) {
			this.set(args.data);
		}

		// Run the query
		this._run('update', this.driver.quoteTable(args.table), args.callback);
	}

	/**
	 * Run the generated delete query
	 *
	 * @param {String} table - The table to insert into
	 * @param {Object} [where] - Where clause for delete statement
	 * @param {Function} callback - Callback for handling response from the database
	 * @return {void}
	 */
	delete(/*table, [where], callback*/) {
		let args = getArgs('table:string, [where]:object, callback:function', arguments);

		if (args.where)
		{
			this.where(args.where);
		}

		// Run the query
		this._run('delete', this.driver.quoteTable(args.table), args.callback);
	}

	// ------------------------------------------------------------------------
	// ! Methods returning SQL
	// ------------------------------------------------------------------------

	/**
	 * Return generated select query SQL
	 *
	 * @param {String} [table] - the name of the table to retrieve from
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return {String}
	 */
	getCompiledSelect(/*table, reset*/) {
		let args = getArgs('[table]:string, [reset]:boolean', arguments);
		if (args.table)
		{
			this.from(args.table);
		}

		return this._getCompile('get', args.table, args.reset);
	}

	/**
	 * Return generated insert query SQL
	 *
	 * @param {String} table - the name of the table to insert into
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return {String}
	 */
	getCompiledInsert(table, reset) {
		return this._getCompile('insert', this.driver.quoteTable(table), reset);
	}

	/**
	 * Return generated update query SQL
	 *
	 * @param {String} table - the name of the table to update
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return {String}
	 */
	getCompiledUpdate(table, reset) {
		return this._getCompile('update', this.driver.quoteTable(table), reset);
	}

	/**
	 * Return generated delete query SQL
	 *
	 * @param {String} table - the name of the table to delete from
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return {String}
	 */
	getCompiledDelete(table, reset) {
		return this._getCompile('delete', this.driver.quoteTable(table), reset);
	}
}