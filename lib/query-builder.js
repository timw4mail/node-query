/** @module query-builder */

var async = require('async');

module.exports = function(driver) {

	"use strict";

	/**
	 * Variables controlling the sql building
	 *
	 * @private
	 * @type {{}}
	 */
	var state = {};

	// ------------------------------------------------------------------------

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
		 * @return {String}
		 */
		compile: function (type, table) {
			switch(type) {
				case "insert":
				break;

				case "update":
				break;

				case "delete":
				break;

				default:
				break;
			}
		},
		compileType: function (type, table) {

		}
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
	 * @param {String|Array} fields
	 * @returns {exports}
	 */
	this.select = function(fields) {

		// Split/trim fields by comma
		fields = (Array.isArray(fields)) ? fields : fields.split(",").map(String.trim);

		// Split on 'As'
		fields.forEach(function (field, index) {
			if (field.match(/as/i))
			{
				fields[index] = field.split(/ as /i).map(String.trim);
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
	 * @param {String} tableName
	 * @returns {exports}
	 */
	this.from = function(tableName) {
		// Split identifiers on spaces
		var identArray = String.trim(tableName).split(' ').map(String.trim);

		// Quote/prefix identifiers
		identArray[0] = driver.quoteTable(identArray[0]);
		identArray = driver.quoteIdentifiers(identArray);

		// Put it back together
		state.fromString = identArray.join(' ');

		return this;
	};

	this.like = function(field, val, pos) {

	};

	this.orLike = function(field, val, pos) {

	};

	this.orNotLike = function(field, val, pos) {

	};

	this.having = function(key, val) {

	};

	this.orHaving = function(key, val) {

	};

	this.where = function(key, val) {

	};

	this.orWhere = function(key, val) {

	};

	this.whereIn = function(key, val) {

	};

	this.orWhereIn = function(key, val) {

	};

	this.whereNotIn = function(key, val) {

	};

	this.orWhereNotIn = function(key, val) {

	};

	this.set = function(key, val) {
		return this;
	};

	this.join = function(table1, cond, table2, type) {
		type = type || "inner";

		return this;
	};

	this.groupBy = function(field) {

	};

	this.orderBy = function(field) {

	};

	this.limit = function(limit, offset) {
		state.limit = limit;
		state.offset = offset;

		return this;
	};

	this.groupStart = function() {

	};

	this.orGroupStart = function() {

	};

	this.orNotGroupStart = function() {

	};

	this.groupEnd = function() {

	};

	// ------------------------------------------------------------------------
	// ! Result Methods
	// ------------------------------------------------------------------------

	this.get = function(table, limit, offset) {
		// Reset state
		this.resetQuery();
	};

	this.getWhere = function(table, where, limit, offset) {
		// Reset state
		this.resetQuery();
	};

	this.insert = function(table, data) {
		// Reset state
		this.resetQuery();
	};

	this.update = function(table, data) {
		// Reset state
		this.resetQuery();
	};

	this['delete'] = function (table, where) {
		// Reset state
		this.resetQuery();
	};

	// ------------------------------------------------------------------------
	// ! Methods returning SQL
	// ------------------------------------------------------------------------

	/**
	 * Return generated select query SQL
	 *
	 * @return {String}
	 */
	this.getCompiledSelect = function() {
		// Return sql

		// Reset state
		this.resetQuery();
	};

	this.getCompiledInsert = function() {
		// Return sql

		// Reset state
		this.resetQuery();
	};

	this.getCompiledUpdate = function() {
		// Return sql

		// Reset state
		this.resetQuery();
	};

	this.getCompiledDelete = function() {
		// Return sql

		// Reset state
		this.resetQuery();
	};

	// ----------------------------------------------------------------------------
	// ! Miscellaneous Methods
	// ----------------------------------------------------------------------------

	/**
	 * Reset the object state for a new query
	 *
	 * @return void
	 */
	this.resetQuery = function() {
		state = {
			// Arrays/Maps
			queryMap: {},
			values: [],
			whereValues: [],
			setArrayKeys: [],
			orderArray: [],
			groupArray: [],
			havingMap: [],

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
	};

	/**
	 * Returns the current class state for testing or other purposes
	 *
	 * @return {Object}
	 */
	this.getState = function() {
		return state;
	};

	return this;
};