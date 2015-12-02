'use strict'

/** @module QueryBuilder */
;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _getargs = require('getargs');

var _getargs2 = _interopRequireDefault(_getargs);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _State = require('./State');

var _State2 = _interopRequireDefault(_State);

var _QueryParser = require('./QueryParser');

var _QueryParser2 = _interopRequireDefault(_QueryParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = (function () {
	/*
  * SQL generation object
  *
  * @param {driver} - The syntax driver for the database
  * @param {adapter} - The database module adapter for running queries
  * @returns {QueryBuilder}
  * @constructor
  */

	function QueryBuilder(driver, adapter) {
		_classCallCheck(this, QueryBuilder);

		this.driver = driver;
		this.adapter = adapter;
		this.parser = new _QueryParser2.default(this.driver);
		this.state = new _State2.default();
	}

	/**
  * Complete the sql building based on the type provided
  *
  * @param {String} type
  * @param {String} table
  * @private
  * @return {String}
  */

	_createClass(QueryBuilder, [{
		key: '_compile',
		value: function _compile(type, table) {
			var _this = this;

			// Put together the basic query
			var sql = this._compileType(type, table);

			// Set each subClause
			['queryMap', 'groupString', 'orderString', 'havingMap'].forEach(function (clause) {
				var param = _this.state[clause];

				if (!_helpers2.default.isScalar(param)) {
					Object.keys(param).forEach(function (part) {
						sql += param[part].conjunction + param[part].string;
					});
				} else {
					sql += param;
				}
			});

			// Append the limit, if it exists
			if (_helpers2.default.isNumber(this.state.limit)) {
				sql = this.driver.limit(sql, this.state.limit, this.state.offset);
			}

			return sql;
		}
	}, {
		key: '_compileType',
		value: function _compileType(type, table) {
			var sql = '';

			switch (type) {
				case "insert":
					var params = Array(this.state.setArrayKeys.length).fill('?');

					sql = 'INSERT INTO ' + table + ' (';
					sql += this.state.setArrayKeys.join(',');
					sql += ") VALUES (";
					sql += params.join(',') + ')';
					break;

				case "update":
					sql = 'UPDATE ' + table + ' SET ' + this.state.setString;
					break;

				case "delete":
					sql = 'DELETE FROM ' + table;
					break;

				default:
					sql = 'SELECT * FROM ' + this.state.fromString;

					// Set the select string
					if (this.state.selectString.length > 0) {
						// Replace the star with the selected fields
						sql = sql.replace('*', this.state.selectString);
					}
					break;
			}

			return sql;
		}
	}, {
		key: '_like',
		value: function _like(field, val, pos, like, conj) {
			field = this.driver.quoteIdentifiers(field);

			like = field + ' ' + like + ' ?';

			if (pos == 'before') {
				val = '%' + val;
			} else if (pos == 'after') {
				val = val + '%';
			} else {
				val = '%' + val + '%';
			}

			conj = this.state.queryMap.length < 1 ? ' WHERE ' : ' ' + conj + ' ';
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

	}, {
		key: '_appendMap',
		value: function _appendMap(conjunction, string, type) {
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

	}, {
		key: '_mixedSet',
		value: function _mixedSet() /* $letName, $valType, $key, [$val] */{
			var _this2 = this;

			var args = (0, _getargs2.default)('$letName:string, $valType:string, $key:object|string|number, [$val]', arguments);

			var obj = {};

			if (_helpers2.default.isScalar(args.$key) && !_helpers2.default.isUndefined(args.$val)) {
				// Convert key/val pair to a simple object
				obj[args.$key] = args.$val;
			} else if (_helpers2.default.isScalar(args.$key) && _helpers2.default.isUndefined(args.$val)) {
				// If just a string for the key, and no value, create a simple object with duplicate key/val
				obj[args.$key] = args.$key;
			} else {
				obj = args.$key;
			}

			Object.keys(obj).forEach(function (k) {
				// If a single value for the return
				if (['key', 'value'].indexOf(args.$valType) !== -1) {
					var pushVal = args.$valType === 'key' ? k : obj[k];
					_this2.state[args.$letName].push(pushVal);
				} else {
					_this2.state[args.$letName][k] = obj[k];
				}
			});

			return this.state[args.$letName];
		}
	}, {
		key: '_whereMixedSet',
		value: function _whereMixedSet() /*key, val*/{
			var args = (0, _getargs2.default)('key:string|object, [val]', arguments);

			this.state.whereMap = [];
			this.state.rawWhereValues = [];

			this._mixedSet('whereMap', 'both', args.key, args.val);
			this._mixedSet('rawWhereValues', 'value', args.key, args.val);
		}
	}, {
		key: '_fixConjunction',
		value: function _fixConjunction(conj) {
			var lastItem = this.state.queryMap[this.state.queryMap.length - 1];
			var conjunctionList = _helpers2.default.arrayPluck(this.state.queryMap, 'conjunction');

			if (this.state.queryMap.length === 0 || !_helpers2.default.regexInArray(conjunctionList, /^ ?WHERE/i)) {
				conj = " WHERE ";
			} else if (lastItem.type === 'groupStart') {
				conj = '';
			} else {
				conj = ' ' + conj + ' ';
			}

			return conj;
		}
	}, {
		key: '_where',
		value: function _where(key, val, defaultConj) {
			var _this3 = this;

			// Normalize key and value and insert into this.state.whereMap
			this._whereMixedSet(key, val);

			// Parse the where condition to account for operators,
			// functions, identifiers, and literal values
			this.state = this.parser.parseWhere(this.driver, this.state);

			this.state.whereMap.forEach(function (clause) {
				var conj = _this3._fixConjunction(defaultConj);
				_this3._appendMap(conj, clause, 'where');
			});

			this.state.whereMap = {};
		}
	}, {
		key: '_whereNull',
		value: function _whereNull(field, stmt, conj) {
			field = this.driver.quoteIdentifiers(field);
			var item = field + ' ' + stmt;

			this._appendMap(this._fixConjunction(conj), item, 'whereNull');
		}
	}, {
		key: '_having',
		value: function _having() /*key, val, conj*/{
			var _this4 = this;

			var args = (0, _getargs2.default)('key:string|object, [val]:string|number, [conj]:string', arguments);
			args.conj = args.conj || 'AND';
			args.val = args.val || null;

			// Normalize key/val and put in state.whereMap
			this._whereMixedSet(args.key, args.val);

			// Parse the having condition to account for operators,
			// functions, identifiers, and literal values
			this.state = this.parser.parseWhere(this.driver, this.state);

			this.state.whereMap.forEach(function (clause) {
				// Put in the having map
				_this4.state.havingMap.push({
					conjunction: _this4.state.havingMap.length > 0 ? ' ' + args.conj + ' ' : ' HAVING ',
					string: clause
				});
			});

			// Clear the where Map
			this.state.whereMap = {};
		}
	}, {
		key: '_whereIn',
		value: function _whereIn() /*key, val, inClause, conj*/{
			var _this5 = this;

			var args = (0, _getargs2.default)('key:string, val:array, inClause:string, conj:string', arguments);

			args.key = this.driver.quoteIdentifiers(args.key);
			var params = new Array(args.val.length);
			params.fill('?');

			args.val.forEach(function (value) {
				_this5.state.whereValues.push(value);
			});

			args.conj = this.state.queryMap.length > 0 ? " " + args.conj + " " : ' WHERE ';
			var str = args.key + " " + args.inClause + " (" + params.join(',') + ") ";

			this._appendMap(args.conj, str, 'whereIn');
		}
	}, {
		key: '_run',
		value: function _run(type, table, callback, sql, vals) {

			if (!sql) {
				sql = this._compile(type, table);
			}

			if (!vals) {
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
	}, {
		key: '_getCompile',
		value: function _getCompile(type, table, reset) {
			reset = reset || false;

			var sql = this._compile(type, table);

			if (reset) this._resetState();

			return sql;
		}
	}, {
		key: '_resetState',
		value: function _resetState() {
			this.state = new _State2.default();
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

	}, {
		key: 'resetQuery',
		value: function resetQuery() {
			this._resetState();
		}

		/**
   * Returns the current class state for testing or other purposes
   *
   * @private
   * @return {Object}
   */

	}, {
		key: 'getState',
		value: function getState() {
			return this.state;
		}

		/**
   * Closes the database connection for the current adapter
   *
   * @return {void}
   */

	}, {
		key: 'end',
		value: function end() {
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

	}, {
		key: 'select',
		value: function select(fields) {

			// Split/trim fields by comma
			fields = Array.isArray(fields) ? fields : fields.split(",").map(_helpers2.default.stringTrim);

			// Split on 'As'
			fields.forEach(function (field, index) {
				if (field.match(/as/i)) {
					fields[index] = field.split(/ as /i).map(_helpers2.default.stringTrim);
				}
			});

			var safeArray = this.driver.quoteIdentifiers(fields);

			// Join the strings back together
			safeArray.forEach(function (field, index) {
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
   * @return {QueryBuilder}
   */

	}, {
		key: 'from',
		value: function from(tableName) {
			// Split identifiers on spaces
			var identArray = tableName.trim().split(' ').map(_helpers2.default.stringTrim);

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

	}, {
		key: 'like',
		value: function like(field, val, pos) {
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

	}, {
		key: 'notLike',
		value: function notLike(field, val, pos) {
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

	}, {
		key: 'orLike',
		value: function orLike(field, val, pos) {
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

	}, {
		key: 'orNotLike',
		value: function orNotLike(field, val, pos) {
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

	}, {
		key: 'having',
		value: function having() /*key, [val]*/{
			var args = (0, _getargs2.default)('key:string|object, [val]:string|number', arguments);

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

	}, {
		key: 'orHaving',
		value: function orHaving() /*key, [val]*/{
			var args = (0, _getargs2.default)('key:string|object, [val]:string|number', arguments);

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

	}, {
		key: 'where',
		value: function where(key, val) {
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

	}, {
		key: 'orWhere',
		value: function orWhere(key, val) {
			this._where(key, val, 'OR');
			return this;
		}

		/**
   * Select a field that is Null
   *
   * @param {String} field - The name of the field that has a NULL value
   * @return {QueryBuilder}
   */

	}, {
		key: 'whereIsNull',
		value: function whereIsNull(field) {
			this._whereNull(field, 'IS NULL', 'AND');
			return this;
		}

		/**
   * Specify that a field IS NOT NULL
   *
   * @param {String} field
   * @return {QueryBuilder}
   */

	}, {
		key: 'whereIsNotNull',
		value: function whereIsNotNull(field) {
			this._whereNull(field, 'IS NOT NULL', 'AND');
			return this;
		}

		/**
   * Field is null prefixed with 'OR'
   *
   * @param {String} field
   * @return {QueryBuilder}
   */

	}, {
		key: 'orWhereIsNull',
		value: function orWhereIsNull(field) {
			this._whereNull(field, 'IS NULL', 'OR');
			return this;
		}

		/**
   * Field is not null prefixed with 'OR'
   *
   * @param {String} field
   * @return {QueryBuilder}
   */

	}, {
		key: 'orWhereIsNotNull',
		value: function orWhereIsNotNull(field) {
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

	}, {
		key: 'whereIn',
		value: function whereIn(key, val) {
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

	}, {
		key: 'orWhereIn',
		value: function orWhereIn(key, val) {
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

	}, {
		key: 'whereNotIn',
		value: function whereNotIn(key, val) {
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

	}, {
		key: 'orWhereNotIn',
		value: function orWhereNotIn(key, val) {
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

	}, {
		key: 'set',
		value: function set() /* $key, [$val] */{
			var args = (0, _getargs2.default)('$key, [$val]', arguments);

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

	}, {
		key: 'join',
		value: function join(table, cond, type) {
			type = type || "inner";

			// Prefix/quote table name
			table = table.split(' ').map(_helpers2.default.stringTrim);
			table[0] = this.driver.quoteTable(table[0]);
			table = table.map(this.driver.quoteIdentifiers);
			table = table.join(' ');

			// Parse out the join condition
			var parsedCondition = this.parser.compileJoin(cond);
			var condition = table + ' ON ' + parsedCondition;

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

	}, {
		key: 'groupBy',
		value: function groupBy(field) {
			if (!_helpers2.default.isScalar(field)) {
				var newGroupArray = field.map(this.driver.quoteIdentifiers);
				this.state.groupArray = this.state.groupArray.concat(newGroupArray);
			} else {
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

	}, {
		key: 'orderBy',
		value: function orderBy(field, type) {
			var _this6 = this;

			type = type || 'ASC';

			// Set the fields for later manipulation
			field = this.driver.quoteIdentifiers(field);

			this.state.orderArray[field] = type;

			var orderClauses = [];

			// Flatten key/val pairs into an array of space-separated pairs
			Object.keys(this.state.orderArray).forEach(function (key) {
				orderClauses.push(key + ' ' + _this6.state.orderArray[key].toUpperCase());
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

	}, {
		key: 'limit',
		value: function limit(_limit, offset) {
			this.state.limit = _limit;
			this.state.offset = offset || null;

			return this;
		}

		/**
   * Adds an open paren to the current query for logical grouping
   *
   * @return {QueryBuilder}
   */

	}, {
		key: 'groupStart',
		value: function groupStart() {
			var conj = this.state.queryMap.length < 1 ? ' WHERE ' : ' AND ';
			this._appendMap(conj, '(', 'groupStart');

			return this;
		}

		/**
   * Adds an open paren to the current query for logical grouping,
   * prefixed with 'OR'
   *
   * @return {QueryBuilder}
   */

	}, {
		key: 'orGroupStart',
		value: function orGroupStart() {
			this._appendMap('', ' OR (', 'groupStart');

			return this;
		}

		/**
   * Adds an open paren to the current query for logical grouping,
   * prefixed with 'OR NOT'
   *
   * @return {QueryBuilder}
   */

	}, {
		key: 'orNotGroupStart',
		value: function orNotGroupStart() {
			this._appendMap('', ' OR NOT (', 'groupStart');

			return this;
		}

		/**
   * Ends a logical grouping started with one of the groupStart methods
   *
   * @return {QueryBuilder}
   */

	}, {
		key: 'groupEnd',
		value: function groupEnd() {
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

	}, {
		key: 'get',
		value: function get() /* [table], [limit], [offset], callback */{
			var args = (0, _getargs2.default)('[table]:string, [limit]:number, [offset]:number, callback:function', arguments);

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

	}, {
		key: 'insert',
		value: function insert() /* table, data, callback */{
			var args = (0, _getargs2.default)('table:string, [data]:object, callback:function', arguments);

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

	}, {
		key: 'insertBatch',
		value: function insertBatch() /* table, data, callback */{
			var args = (0, _getargs2.default)('table:string, data:array, callback:function', arguments);
			var batch = this.driver.insertBatch(args.table, args.data);

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

	}, {
		key: 'update',
		value: function update() /*table, data, callback*/{
			var args = (0, _getargs2.default)('table:string, [data]:object, callback:function', arguments);

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

	}, {
		key: 'delete',
		value: function _delete() /*table, [where], callback*/{
			var args = (0, _getargs2.default)('table:string, [where]:object, callback:function', arguments);

			if (args.where) {
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

	}, {
		key: 'getCompiledSelect',
		value: function getCompiledSelect() /*table, reset*/{
			var args = (0, _getargs2.default)('[table]:string, [reset]:boolean', arguments);
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
   * @return {String}
   */

	}, {
		key: 'getCompiledInsert',
		value: function getCompiledInsert(table, reset) {
			return this._getCompile('insert', this.driver.quoteTable(table), reset);
		}

		/**
   * Return generated update query SQL
   *
   * @param {String} table - the name of the table to update
   * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
   * @return {String}
   */

	}, {
		key: 'getCompiledUpdate',
		value: function getCompiledUpdate(table, reset) {
			return this._getCompile('update', this.driver.quoteTable(table), reset);
		}

		/**
   * Return generated delete query SQL
   *
   * @param {String} table - the name of the table to delete from
   * @param {Boolean} [reset=true] - Whether to reset the query builder so another query can be built
   * @return {String}
   */

	}, {
		key: 'getCompiledDelete',
		value: function getCompiledDelete(table, reset) {
			return this._getCompile('delete', this.driver.quoteTable(table), reset);
		}
	}]);

	return QueryBuilder;
})();
//# sourceMappingURL=QueryBuilder.js.map
