'use strict';

var helpers = require('./helpers');

var matchPatterns = {
	'function': /([a-zA-Z0-9_]+\((.*?)\))/i,
	identifier: /([a-zA-Z0-9_\-]+\.?)+/ig,
	operator: /\=|AND|&&?|~|\|\|?|\^|\/|>=?|<=?|-|%|OR|\+|NOT|\!=?|<>|XOR/i
};

// Full pattern for determining ordering of the pieces
matchPatterns.combined = new RegExp(matchPatterns['function'].source + "+|"
	+ matchPatterns.identifier.source
	+ '|(' + matchPatterns.operator.source + ')+', 'ig');

var filterMatches = function(array) {
	var output = [];

	// Return non-array matches
	if (helpers.isScalar(array) || helpers.isNull(array) || helpers.isUndefined(array)) return output;

	array.forEach(function(item) {
		if ( ! helpers.isUndefined(item))
		{
			output.push(item);
		}
	});

	return output;
};

// --------------------------------------------------------------------------

/**
 * @constructor
 * @param {Driver} - The driver object for the database in use
 * @module query-parser
 */
var QueryParser = function(driver) {

	// That 'new' keyword is annoying
	if ( ! (this instanceof QueryParser)) return new QueryParser(driver);

	/**
	 * Tokenize the sql into parts for additional processing
	 *
	 * @param {String} sql
	 * @return {Object}
	 */
	this.parseJoin = function(sql) {
		var matches = {};
		var output = {};

		// Get clause components
		matches['function'] = sql.match(matchPatterns['function']);
		matches.identifiers = sql.match(matchPatterns.identifier);
		matches.operators = sql.match(matchPatterns.operator);

		// Get everything at once for ordering
		matches.combined = sql.match(matchPatterns.combined);

		// Flatten the matches to increase relevance
		Object.keys(matches).forEach(function(key) {
			output[key] = filterMatches(matches[key]);
		});

		return output;
	};

	/**
	 * Return the output of the parsing of the join condition
	 *
	 * @param {String} condition - The join condition to evalate
	 * @return {String} - The parsed/escaped join condition
	 */
	this.compileJoin = function(condition) {
		var parts = this.parseJoin(condition);
		var count = parts.identifiers.length;
		var i;

		// Quote the identifiers
		parts.combined.forEach(function(part, i) {
			if (parts.identifiers.indexOf(part) !== -1 && ! helpers.isNumber(part))
			{
				parts.combined[i] = driver.quoteIdentifiers(part);
			}
		});

		return parts.combined.join('');
	};
};

module.exports = QueryParser;
