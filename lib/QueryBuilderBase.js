'use strict';

const getArgs = require('getargs');
const helpers = require('./helpers');
const QueryParser = require('./QueryParser');
const State = require('./State');

class QueryBuilderBase {
	/**
	 * @private
	 * @constructor
	 * @param {Driver} Driver - The syntax driver for the database
	 * @param {Adapter} Adapter - The database module adapter for running queries
	 */
	constructor (Driver, Adapter) {
		this.driver = Driver;
		this.adapter = Adapter;
		this.parser = new QueryParser(this.driver);
		this.state = new State();
	}

	/**
	 * Complete the sql building based on the type provided
	 *
	 * @private
	 * @param {String} type - Type of SQL query
	 * @param {String} table - The table to run the query on
	 * @return {String} - The compiled sql
	 */
	_compile (type, table) {
		// Put together the basic query
		let sql = this._compileType(type, table);

		// Set each subClause
		['queryMap', 'groupString', 'orderString', 'havingMap'].forEach(clause => {
			let param = this.state[clause];

			if (!helpers.isScalar(param)) {
				Object.keys(param).forEach(part => {
					sql += param[part].conjunction + param[part].string;
				});
			} else {
				sql += param;
			}
		});

		// Append the limit, if it exists
		if (helpers.isNumber(this.state.limit)) {
			sql = this.driver.limit(sql, this.state.limit, this.state.offset);
		}

		return sql;
	}

	_compileType (type, table) {
		let sql = '';

		switch (type) {
			case 'insert':
				let params = Array(this.state.setArrayKeys.length).fill('?');

				sql = `INSERT INTO ${table} (`;
				sql += this.state.setArrayKeys.join(',');
				sql += `) VALUES (${params.join(',')})`;
				break;

			case 'update':
				sql = `UPDATE ${table} SET ${this.state.setString}`;
				break;

			case 'delete':
				sql = `DELETE FROM ${table}`;
				break;

			default:
				sql = `SELECT * FROM ${this.state.fromString}`;

				// Set the select string
				if (this.state.selectString.length > 0) {
					// Replace the star with the selected fields
					sql = sql.replace('*', this.state.selectString);
				}

				break;
		}

		return sql;
	}

	_like (field, val, pos, like, conj) {
		field = this.driver.quoteIdentifiers(field);

		like = `${field} ${like} ?`;

		if (pos === 'before') {
			val = `%${val}`;
		} else if (pos === 'after') {
			val = `${val}%`;
		} else {
			val = `%${val}%`;
		}

		conj = (this.state.queryMap.length < 1) ? ' WHERE ' : ` ${conj} `;
		this._appendMap(conj, like, 'like');

		this.state.whereValues.push(val);
	}

	/**
	 * Append a clause to the query map
	 *
	 * @private
	 * @param {String} conjunction - linking keyword for the clause
	 * @param {String} string - pre-compiled sql fragment
	 * @param {String} type - type of sql clause
	 * @return {void}
	 */
	_appendMap (conjunction, string, type) {
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
	 * @return {Array} - modified state array
	 */
	_mixedSet (/* $letName, $valType, $key, [$val] */) {
		const argPattern = '$letName:string, $valType:string, $key:object|string|number, [$val]';
		let args = getArgs(argPattern, arguments);

		let obj = {};

		if (helpers.isScalar(args.$key) && !helpers.isUndefined(args.$val)) {
			// Convert key/val pair to a simple object
			obj[args.$key] = args.$val;
		} else if (helpers.isScalar(args.$key) && helpers.isUndefined(args.$val)) {
			// If just a string for the key, and no value, create a simple object with duplicate key/val
			obj[args.$key] = args.$key;
		} else {
			obj = args.$key;
		}

		Object.keys(obj).forEach(k => {
			// If a single value for the return
			if (['key', 'value'].indexOf(args.$valType) !== -1) {
				let pushVal = (args.$valType === 'key') ? k : obj[k];
				this.state[args.$letName].push(pushVal);
			} else {
				this.state[args.$letName][k] = obj[k];
			}
		});

		return this.state[args.$letName];
	}

	_whereMixedSet (/* key, val */) {
		let args = getArgs('key:string|object, [val]', arguments);

		this.state.whereMap = [];
		this.state.rawWhereValues = [];

		this._mixedSet('whereMap', 'both', args.key, args.val);
		this._mixedSet('rawWhereValues', 'value', args.key, args.val);
	}

	_fixConjunction (conj) {
		let lastItem = this.state.queryMap[this.state.queryMap.length - 1];
		let conjunctionList = helpers.arrayPluck(this.state.queryMap, 'conjunction');

		if (this.state.queryMap.length === 0 || (!helpers.regexInArray(conjunctionList, /^ ?WHERE/i))) {
			conj = ' WHERE ';
		} else if (lastItem.type === 'groupStart') {
			conj = '';
		} else {
			conj = ` ${conj} `;
		}

		return conj;
	}

	_where (key, val, defaultConj) {
		// Normalize key and value and insert into this.state.whereMap
		this._whereMixedSet(key, val);

		// Parse the where condition to account for operators,
		// functions, identifiers, and literal values
		this.state = this.parser.parseWhere(this.driver, this.state);

		this.state.whereMap.forEach(clause => {
			let conj = this._fixConjunction(defaultConj);
			this._appendMap(conj, clause, 'where');
		});

		this.state.whereMap = {};
	}

	_whereNull (field, stmt, conj) {
		field = this.driver.quoteIdentifiers(field);
		let item = `${field} ${stmt}`;

		this._appendMap(this._fixConjunction(conj), item, 'whereNull');
	}

	_having (/* key, val, conj */) {
		let args = getArgs('key:string|object, [val]:string|number, [conj]:string', arguments);
		args.conj = args.conj || 'AND';
		args.val = args.val || null;

		// Normalize key/val and put in state.whereMap
		this._whereMixedSet(args.key, args.val);

		// Parse the having condition to account for operators,
		// functions, identifiers, and literal values
		this.state = this.parser.parseWhere(this.driver, this.state);

		this.state.whereMap.forEach(clause => {
			// Put in the having map
			this.state.havingMap.push({
				conjunction: (this.state.havingMap.length > 0) ? ` ${args.conj} ` : ' HAVING ',
				string: clause
			});
		});

		// Clear the where Map
		this.state.whereMap = {};
	}

	_whereIn (/* key, val, inClause, conj */) {
		let args = getArgs('key:string, val:array, inClause:string, conj:string', arguments);

		args.key = this.driver.quoteIdentifiers(args.key);
		let params = Array(args.val.length);
		params.fill('?');

		args.val.forEach(value => {
			this.state.whereValues.push(value);
		});

		args.conj = (this.state.queryMap.length > 0) ? ` ${args.conj} ` : ' WHERE ';
		let str = `${args.key} ${args.inClause} (${params.join(',')}) `;

		this._appendMap(args.conj, str, 'whereIn');
	}

	_run (type, table, callback, sql, vals) {
		if (!sql) {
			sql = this._compile(type, table);
		}

		if (!vals) {
			vals = this.state.values.concat(this.state.whereValues);
		}

		// Reset the state so another query can be built
		this._resetState();

		// Pass the sql and values to the adapter to run on the database
		if (callback) {
			return this.query(sql, vals, callback);
		} else {
			return this.query(sql, vals);
		}
	}

	_getCompile (type, table, reset) {
		reset = reset || false;

		let sql = this._compile(type, table);

		if (reset) {
			this._resetState();
		}

		return sql;
	}

	_resetState () {
		this.state = new State();
	}
}

module.exports = QueryBuilderBase;
