'use strict';

/** @module query-builder */
var getArgs = require('getargs'),
	helpers = require('./helpers');

/**
 * Variables controlling the sql building
 *
 * @private
 */
var state = {};

/*
 * SQL generation object
 *
 * @param {driver} - The syntax driver for the database
 * @param {adapter} - The database module adapter for running queries
 * @constructor
 */
var QueryBuilder = function(driver, adapter) {

	// That 'new' keyword is annoying
	if ( ! (this instanceof QueryBuilder)) return new QueryBuilder(driver, adapter);

	var parser = require('./query-parser')(driver);

	this.driver = driver;
	this.adapter = adapter;

	/**
	 * "Private" methods
	 *
	 * @private
	 */
	var _p = {
		/**
		 * Complete the sql building based on the type provided
		 *
		 * @param {String} type
		 * @param {String} table
		 * @private
		 * @return {String}
		 */
		compile: function (type, table) {
			// Put together the basic query
			var sql = _p.compileType(type, table);

			// Set each subClause
			['queryMap', 'groupString', 'orderString', 'havingMap'].forEach(function(clause) {
				var param = state[clause];

				if ( ! helpers.isScalar(param))
				{
					Object.keys(param).forEach(function(part) {
						sql += param[part].conjunction + param[part].string;
					});
				}
				else
				{
					sql += param;
				}
			});

			// Append the limit, if it exists
			if (helpers.isNumber(state.limit))
			{
				sql = driver.limit(sql, state.limit, state.offset);
			}

			return sql;
		},
		compileType: function (type, table) {
			var sql = '';

			switch(type) {
				case "insert":
					var params = new Array(state.setArrayKeys.length);
					params.fill('?');

					sql = "INSERT INTO " + table + " (";
					sql += state.setArrayKeys.join(',');
					sql += ") VALUES (";
					sql += params.join(',') + ')';
				break;

				case "update":
					sql = "UPDATE " + table + " SET " + state.setString;
				break;

				case "delete":
					sql = "DELETE FROM " + table;
				break;

				default:
					sql = "SELECT * FROM " + state.fromString;

					// Set the select string
					if (state.selectString.length > 0)
					{
						// Replace the star with the selected fields
						sql = sql.replace('*', state.selectString);
					}
				break;
			}

			return sql;
		},
		like: function (field, val, pos, like, conj) {
			field = driver.quoteIdentifiers(field);

			like = field + " " + like + " ?";

			if (pos == 'before')
			{
				val = "%" + val;
			}
			else if (pos == 'after')
			{
				val = val + "%";
			}
			else
			{
				val = "%" + val + "%";
			}

			conj = (state.queryMap.length < 1) ? ' WHERE ' : ' ' + conj + ' ';
			_p.appendMap(conj, like, 'like');

			state.whereValues.push(val);
		},
		/**
		 * Append a clause to the query map
		 *
		 * @param {String} conjunction
		 * @param {String} string
		 * @param {String} type
		 * @return void
		 */
		appendMap: function(conjunction, string, type) {
			state.queryMap.push({
				type: type,
				conjunction: conjunction,
				string: string
			});
		},
		/**
		 * Handle key/value pairs in an object the same way as individual arguments,
		 * when appending to state
		 *
		 * @private
		 */
		mixedSet: function(/* $varName, $valType, $key, [$val] */) {
			var args = getArgs('$varName:string, $valType:string, $key:object|string|number, [$val]', arguments);

			var obj = {};

			if (helpers.isScalar(args.$key) && !helpers.isUndefined(args.$val) && !helpers.isNull(args.$val))
			{
				obj[args.$key] = args.$val;
			}
			else if ( ! helpers.isScalar(args.$key))
			{
				obj = args.$key;
			}
			else
			{
				throw new Error("Invalid arguments passed");
			}

			Object.keys(obj).forEach(function(k) {
				// If a single value for the return
				if (['key','value'].indexOf(args.$valType) !== -1)
				{
					var pushVal = (args.$valType === 'key') ? k : obj[k];
					state[args.$varName].push(pushVal);
				}
				else
				{
					state[args.$varName][k] = obj[k];
				}
			});

			return state[args.$varName];
		},
		whereMixedSet: function(/*key, val*/) {
			var args = getArgs('key:string|object, [val]', arguments);

			state.whereMap = [];

			_p.mixedSet('whereMap', 'both', args.key, args.val);
			_p.mixedSet('whereValues', 'value', args.key, args.val);
		},
		where: function(key, val, conj) {
			conj = conj || 'AND';

			// Normalize key and value and insert into state.whereMap
			_p.whereMixedSet(key, val);

			Object.keys(state.whereMap).forEach(function(field) {
				// Split each key by spaces, in case there
				// is an operator such as >, <, !=, etc.
				var fieldArray = field.trim().split(' ').map(helpers.stringTrim);

				var item = driver.quoteIdentifiers(fieldArray[0]);

				// Simple key value, or an operator?
				item += (fieldArray.length === 1 || fieldArray[1] === '') ? '=?' : " " + fieldArray[1] + " ?";

				var firstItem = state.queryMap[0],
					lastItem = state.queryMap[state.queryMap.length - 1];

				// Determine the correct conjunction
				if (state.queryMap.length < 1 || firstItem.conjunction.contains('JOIN'))
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

				_p.appendMap(conj, item, 'where');
			});
		},
		having: function(/*key, val, conj*/) {
			var args = getArgs('key:string|object, [val]:string|number, [conj]:string', arguments);
			args.conj = args.conj || 'AND';
			args.val = args.val || null;

			// Normalize key/val and put in state.whereMap
			_p.whereMixedSet(args.key, args.val);

			Object.keys(state.whereMap).forEach(function(field) {
				// Split each key by spaces, in case there
				// is an operator such as >, <, !=, etc.
				var fieldArray = field.split(' ').map(helpers.stringTrim);

				var item = driver.quoteIdentifiers(fieldArray[0]);

				// Simple key value, or an operator?
				item += (fieldArray.length === 1) ? '=?' : " " + fieldArray[1] + " ?";

				// Put in the having map
				state.havingMap.push({
					conjunction: (state.havingMap.length > 0) ? " " + args.conj + " " : ' HAVING ',
					string: item
				});
			});
		},
		whereIn: function(/*key, val, inClause, conj*/) {
			var args = getArgs('key:string, val:array, inClause:string, conj:string', arguments);

			args.key = driver.quoteIdentifiers(args.key);
			var params = new Array(args.val.length);
			params.fill('?');

			args.val.forEach(function(value) {
				state.whereValues.push(value);
			});

			args.conj = (state.queryMap.length > 0) ? " " + args.conj + " " : ' WHERE ';
			var str = args.key + " " + args.inClause + " (" + params.join(',') + ") ";

			_p.appendMap(args.conj, str, 'whereIn');
		},
		run: function(type, table, callback, sql, vals) {
			if ( ! sql)
			{
				sql = _p.compile(type, table);
			}
//console.log(sql);
//console.log('------------------------');

			if ( ! vals)
			{
				vals = state.values.concat(state.whereValues);
			}

			// Reset the state so another query can be built
			_p.resetState();

			// Pass the sql and values to the adapter to run on the database
			adapter.execute(sql, vals, callback);

		},
		getCompile: function(type, table, reset) {
			reset = reset || false;

			var sql = _p.compile(type, table);

			if (reset) _p.resetState();

			return sql;
		},
		resetState: function() {
			state = {
				// Arrays/Maps
				queryMap: [],
				values: [],
				whereValues: [],
				setArrayKeys: [],
				orderArray: [],
				groupArray: [],
				havingMap: [],
				whereMap: [],

				// Partials
				selectString: '',
				fromString: '',
				setString: '',
				orderString: '',
				groupString: '',

				// Other various values
				limit: null,
				offset: null
			};
		}
	};

	// ----------------------------------------------------------------------------
	// ! Miscellaneous Methods
	// ----------------------------------------------------------------------------

	/**
	 * Reset the object state for a new query
	 *
	 * @memberOf query-builder
	 * @return void
	 */
	this.resetQuery = function() {
		_p.resetState();
	};

	/**
	 * Returns the current class state for testing or other purposes
	 *
	 * @private
	 * @return {Object}
	 */
	this.getState = function() {
		return state;
	};

	// ------------------------------------------------------------------------

	// Set up state object
	this.resetQuery();

	// ------------------------------------------------------------------------
	// ! Query Builder Methods
	// ------------------------------------------------------------------------

	/**
	 * Specify rows to select in the query
	 *
	 * @param {String|Array} fields - The fields to select from the current table
	 * @return this
	 */
	this.select = function(fields) {

		// Split/trim fields by comma
		fields = (Array.isArray(fields)) ? fields : fields.split(",").map(helpers.stringTrim);

		// Split on 'As'
		fields.forEach(function (field, index) {
			if (field.match(/as/i))
			{
				fields[index] = field.split(/ as /i).map(helpers.stringTrim);
			}
		});

		var safeArray = driver.quoteIdentifiers(fields);

		// Join the strings back together
		safeArray.forEach(function (field, index) {
			if (Array.isArray(field))
			{
				safeArray[index] = safeArray[index].join(' AS ');
			}
		});

		state.selectString += safeArray.join(', ');

		return this;
	};

	/**
	 * Specify the database table to select from
	 *
	 * @param {String} tableName - The table to use for the current query
	 * @return this
	 */
	this.from = function(tableName) {
		// Split identifiers on spaces
		var identArray = tableName.trim().split(' ').map(helpers.stringTrim);

		// Quote/prefix identifiers
		identArray[0] = driver.quoteTable(identArray[0]);
		identArray = driver.quoteIdentifiers(identArray);

		// Put it back together
		state.fromString = identArray.join(' ');

		return this;
	};

	/**
	 * Add a 'like/ and like' clause to the query
	 *
	 * @param {String} field - The name of the field  to compare to
	 * @param {String} val - The value to compare to
	 * @param {String} [pos=both] - The placement of the wildcard character(s): before, after, or both
	 * @return this
	 */
	this.like = function(field, val, pos) {
		_p.like(field, val, pos, ' LIKE ', 'AND');
		return this;
	};

	/**
	 * Add a 'not like/ and not like' clause to the query
	 *
	 * @param {String} field - The name of the field  to compare to
	 * @param {String} val - The value to compare to
	 * @param {String} [pos=both] - The placement of the wildcard character(s): before, after, or both
	 * @return this
	 */
	this.notLike = function(field, val, pos) {
		_p.like(field, val, pos, ' NOT LIKE ', 'AND');
		return this;
	};

	/**
	 * Add an 'or like' clause to the query
	 *
	 * @param {String} field - The name of the field  to compare to
	 * @param {String} val - The value to compare to
	 * @param {String} [pos=both] - The placement of the wildcard character(s): before, after, or both
	 * @return this
	 */
	this.orLike = function(field, val, pos) {
		_p.like(field, val, pos, ' LIKE ', 'OR');
		return this;
	};

	/**
	 * Add an 'or not like' clause to the query
	 *
	 * @param {String} field - The name of the field  to compare to
	 * @param {String} val - The value to compare to
	 * @param {String} [pos=both] - The placement of the wildcard character(s): before, after, or both
	 * @return this
	 */
	this.orNotLike = function(field, val, pos) {
		_p.like(field, val, pos, ' NOT LIKE ', 'OR');
		return this;
	};

	/**
	 * Add a 'having' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return this
	 */
	this.having = function(/*key, [val]*/) {
		var args = getArgs('key:string|object, [val]:string|number', arguments);

		_p.having(args.key, args.val, 'AND');
		return this;
	};

	/**
	 * Add an 'or having' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return this
	 */
	this.orHaving = function(/*key, [val]*/) {
		var args = getArgs('key:string|object, [val]:string|number', arguments);

		_p.having(args.key, args.val, 'OR');
		return this;
	};

	/**
	 * Set a 'where' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return this
	 */
	this.where = function(key, val) {
		_p.where(key, val, 'AND');
		return this;
	};

	/**
	 * Set a 'or where' clause
	 *
	 * @param {String|Object} key - The name of the field and the comparision operator, or an object
	 * @param {String|Number} [val] - The value to compare if the value of key is a string
	 * @return this
	 */
	this.orWhere = function(key, val) {
		_p.where(key, val, 'OR');
		return this;
	};

	/**
	 * Set a 'where in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} val - the array of items to search in
	 * @return this
	 */
	this.whereIn = function(key, val) {
		_p.whereIn(key, val, 'IN', 'AND');
		return this;
	};

	/**
	 * Set a 'or where in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} val - the array of items to search in
	 * @return this
	 */
	this.orWhereIn = function(key, val) {
		_p.whereIn(key, val, 'IN', 'OR');
		return this;
	};

	/**
	 * Set a 'where not in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} val - the array of items to search in
	 * @return this
	 */
	this.whereNotIn = function(key, val) {
		_p.whereIn(key, val, 'NOT IN', 'AND');
		return this;
	};

	/**
	 * Set a 'or where not in' clause
	 *
	 * @param {String} key - the field to search
	 * @param {Array} val - the array of items to search in
	 * @return this
	 */
	this.orWhereNotIn = function(key, val) {
		_p.whereIn(key, val, 'NOT IN', 'OR');
		return this;
	};

	/**
	 * Set values for insertion or updating
	 *
	 * @param {String|Object} key - The key or object to use
	 * @param {String} [val] - The value if using a scalar key
	 * @return this
	 */
	this.set = function(/* $key, [$val] */) {
		var args = getArgs('$key, [$val]', arguments);

		// Set the appropriate state variables
		_p.mixedSet('setArrayKeys', 'key', args.$key, args.$val);
		_p.mixedSet('values', 'value', args.$key, args.$val);

		// Use the keys of the array to make the insert/update string
		// and escape the field names
		state.setArrayKeys = state.setArrayKeys.map(driver._quote);

		// Generate the "set" string
		state.setString = state.setArrayKeys.join('=?,');
		state.setString += '=?';

		return this;
	};

	/**
	 * Add a join clause to the query
	 *
	 * @param {String} table - The table you are joining
	 * @param {String} cond - The join condition.
	 * @param {String} [type='inner'] - The type of join, which defaults to inner
	 * @return this
	 */
	this.join = function(table, cond, type) {
		type = type || "inner";

		// Prefix/quote table name
		var table = table.split(' ').map(helpers.stringTrim);
		table[0] = driver.quoteTable(table[0]);
		table = table.map(driver.quoteIdentifiers);
		table = table.join(' ');

		// Parse out the join condition
		var parsedCondition = parser.compileJoin(cond);
		var condition = table + ' ON ' + parsedCondition;

		// Append the join condition to the query map
		_p.appendMap("\n" + type.toUpperCase() + ' JOIN ', condition, 'join');

		return this;
	};

	/**
	 * Group the results by the selected field(s)
	 *
	 * @param {String|Array} field
	 * @return this
	 */
	this.groupBy = function(field) {
		if (Array.isArray(field))
		{
			var newGroupArray = field.map(driver.quoteIdentifiers);
			state.groupArray.concat(newGroupArray);
		}
		else
		{
			state.groupArray.push(driver.quoteIdentifiers(field));
		}

		state.groupString = ' GROUP BY ' + state.groupArray.join(',');

		return this;
	};

	/**
	 * Order the results by the selected field(s)
	 *
	 * @param {String} field - The field(s) to order by
	 * @param {String} [type='ASC'] - The order direction, ASC or DESC
	 * @return this
	 */
	this.orderBy = function(field, type) {
		type = type || 'ASC';

		// Set the fields for later manipulation
		field = driver.quoteIdentifiers(field);

		state.orderArray[field] = type;

		var orderClauses = [];

		// Flatten key/val pairs into an array of space-separated pairs
		Object.keys(state.orderArray).forEach(function(key) {
			orderClauses.push(key + ' ' + state.orderArray[key].toUpperCase());
		});

		// Set the final string
		state.orderString = ' ORDER BY ' + orderClauses.join(', ');

		return this;
	};

	/**
	 * Put a limit on the query
	 *
	 * @param {Number} limit - The maximum number of rows to fetch
	 * @param {Number} [offset] - The row number to start from
	 * @return this
	 */
	this.limit = function(limit, offset) {
		state.limit = limit;
		state.offset = offset || null;

		return this;
	};

	/**
	 * Adds an open paren to the current query for logical grouping
	 *
	 * @return this
	 */
	this.groupStart = function() {
		var conj = (state.queryMap.length < 1) ? ' WHERE ' : ' ';
		_p.appendMap(conj, '(', 'groupStart');

		return this;
	};

	/**
	 * Adds an open paren to the current query for logical grouping,
	 * prefixed with 'OR'
	 *
	 * @return this
	 */
	this.orGroupStart = function() {
		_p.appendMap('', ' OR (', 'groupStart');

		return this;
	};

	/**
	 * Adds an open paren to the current query for logical grouping,
	 * prefixed with 'OR NOT'
	 *
	 * @return this
	 */
	this.orNotGroupStart = function() {
		_p.appendMap('', ' OR NOT (', 'groupStart');

		return this;
	};

	/**
	 * Ends a logical grouping started with one of the groupStart methods
	 *
	 * @return this
	 */
	this.groupEnd = function() {
		_p.appendMap('', ')', 'groupEnd');

		return this;
	};

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
	 * @return void
	 */
	this.get = function(/* [table], [limit], [offset], callback */) {
		var args = getArgs('[table]:string, [limit]:number, [offset]:number, callback:function', arguments);

		if (args.table) {
			this.from(args.table);
		}

		if (args.limit) {
			this.limit(args.limit, args.offset);
		}

		// Run the query
		_p.run('get', args.table, args.callback);
	};

	/**
	 * Run the generated insert query
	 *
	 * @param {String} table - The table to insert into
	 * @param {Object} [data] - Data to insert, if not already added with the 'set' method
	 * @param {Function} callback - Callback for handling response from the database
	 * @return void
	 */
	this.insert = function(/* table, data, callback */) {
		var args = getArgs('table:string, [data]:object, callback:function', arguments);
		if (args.data) {
			this.set(args.data);
		}

		// Run the query
		_p.run('insert', args.table, args.callback);
	};

	/**
	 * Run the generated update query
	 *
	 * @param {String} table - The table to insert into
	 * @param {Object} [data] - Data to insert, if not already added with the 'set' method
	 * @param {Function} callback - Callback for handling response from the database
	 * @return void
	 */
	this.update = function(/*table, data, callback*/) {
		var args = getArgs('table:string, [data]:object, callback:function', arguments);
		if (args.data) {
			this.set(args.data);
		}

		// Run the query
		_p.run('update', args.table, args.callback);
	};

	/**
	 * Run the generated delete query
	 *
	 * @param {String} table - The table to insert into
	 * @param {Function} callback - Callback for handling response from the database
	 * @return void
	 */
	this['delete'] = function (/*table, [where], callback*/) {
		var args = getArgs('table:string, [where], callback:function', arguments);

		if (args.where)
		{
			this.where(args.where);
		}

		// Run the query
		_p.run('delete', args.table, args.callback);
	};

	// ------------------------------------------------------------------------
	// ! Methods returning SQL
	// ------------------------------------------------------------------------

	/**
	 * Return generated select query SQL
	 *
	 * @param {String} [table] - the name of the table to retrieve from
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return String
	 */
	this.getCompiledSelect = function(table, reset) {
		if (table)
		{
			this.from(table);
		}

		return _p.getCompile('get', table, reset);
	};

	/**
	 * Return generated insert query SQL
	 *
	 * @param {String} table - the name of the table to insert into
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return {String}
	 */
	this.getCompiledInsert = function(table, reset) {
		return _p.getCompile('insert', table, reset);
	};

	/**
	 * Return generated update query SQL
	 *
	 * @param {String} table - the name of the table to update
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return {String}
	 */
	this.getCompiledUpdate = function(table, reset) {
		return _p.getCompile('update', table, reset);
	};

	/**
	 * Return generated delete query SQL
	 *
	 * @param {String} table - the name of the table to delete from
	 * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
	 * @return {String}
	 */
	this.getCompiledDelete = function(table, reset) {
		return _p.getCompile('delete', table, reset);
	};

	return this;
};

module.exports = QueryBuilder;