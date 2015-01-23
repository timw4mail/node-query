'use strict';

var helpers = require('./helpers');

var matchPatterns = {
	'function': /([a-z0-9_]+\((.*)\))/i,
	operator: /\!=?|\=|\+|&&?|~|\|\|?|\^|\/|<>|>=?|<=?|\-|%|OR|AND|NOT|XOR/ig,
	literal: /([0-9]+)|'(.*?)'|true|false/ig
};

// Full pattern for identifiers
// Making sure that literals and functions aren't matched
matchPatterns.identifier = new RegExp(
	'('
		+ '(?!'
			+ matchPatterns['function'].source + '|'
			+ matchPatterns.literal.source
		+ ')'
		+ '([a-z_\-]+[0-9]*\\.?)'
	+ ')+'
, 'ig');

// Full pattern for determining ordering of the pieces
matchPatterns.joinCombined = new RegExp(
	matchPatterns['function'].source + "+|"
	+ matchPatterns.literal.source + '+|'
	+ matchPatterns.identifier.source
	+ '|(' + matchPatterns.operator.source + ')+'
, 'ig');

var identifierBlacklist = ['true','false','null'];

var filterMatches = function(array) {
	var output = [];

	// Return non-array matches
	if (helpers.isNull(array)) return null;
	if (helpers.isScalar(array) || helpers.isUndefined(array)) return output;

	array.forEach(function(item) {
		output.push(item);
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
	 * Check if the string contains an operator, and if so, return the operator(s).
	 * If there are no matches, return null
	 *
	 * @param {String} string - the string to check
	 * @return {Array|null}
	 */
	this.hasOperator = function(string) {
		return filterMatches(string.match(matchPatterns.operator));
	}

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
		matches.functions = sql.match(new RegExp(matchPatterns['function'].source, 'ig'));
		matches.identifiers = sql.match(matchPatterns.identifier);
		matches.operators = sql.match(matchPatterns.operator);
		matches.literals = sql.match(matchPatterns.literal);

		// Get everything at once for ordering
		matches.combined = sql.match(matchPatterns.joinCombined);

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

		return parts.combined.join(' ');
	};

	/**
	 * Parse a where clause to separate functions from values
	 *
	 * @param {Object} driver
	 * @param {State} state
	 * @return {String} - The parsed/escaped where condition
	 */
	this.parseWhere = function(driver, state) {
		var whereMap = state.whereMap,
			whereValues = state.rawWhereValues;

		var outputMap = [];
		var outputValues = [];
		var that = this;

		Object.keys(whereMap).forEach(function(key) {
			// Combine fields, operators, functions and values into a full clause
			// to have a common starting flow
			var fullClause = '';

			// Add an explicit = sign where one is inferred
			if ( ! that.hasOperator(key))
			{
				fullClause = key + ' = ' + whereMap[key];
			}
			else if (whereMap[key] === key)
			{
				fullClause = key;
			}
			else
			{
				fullClause = key + ' ' + whereMap[key];
			}

			// Separate the clause into separate pieces
			var parts = that.parseJoin(fullClause);

			// Filter explicit literals from lists of matches
			if (whereValues.indexOf(whereMap[key]) !== -1)
			{
				var value = whereMap[key];
				var identIndex = (helpers.isArray(parts.identifiers)) ? parts.identifiers.indexOf(value) : -1;
				var litIndex = (helpers.isArray(parts.literals)) ? parts.literals.indexOf(value) : -1;
				var combIndex = (helpers.isArray(parts.combined)) ? parts.combined.indexOf(value) : -1;
				var funcIndex = (helpers.isArray(parts.functions)) ? parts.functions.indexOf(value) : -1;
				var inOutputArray = outputValues.indexOf(value) !== -1;

				// Remove the identifier in question,
				// and add to the output values array
				if (identIndex !== -1)
				{
					parts.identifiers.splice(identIndex, 1);

					if ( ! inOutputArray)
					{
						outputValues.push(value);
						inOutputArray = true;
					}
				}

				// Remove the value from the literals list
				// so it is not added twice
				if (litIndex !== -1)
				{
					parts.literals.splice(litIndex, 1);

					if ( ! inOutputArray)
					{
						outputValues.push(value);
						inOutputArray = true;
					}
				}

				// Remove the value from the combined list
				// and replace it with a placeholder
				if (combIndex !== -1)
				{
					// Make sure to skip functions when replacing values
					if (funcIndex === -1)
					{
						parts.combined[combIndex] = '?';

						if ( ! inOutputArray)
						{
							outputValues.push(value);
							inOutputArray = true;
						}
					}
				}
			}

			// Filter false positive identifiers
			parts.identifiers = parts.identifiers.filter(function(item) {
				var isInCombinedMatches = parts.combined.indexOf(item) !== -1;
				var isNotInBlackList = identifierBlacklist.indexOf(item.toLowerCase()) === -1;

				return isInCombinedMatches && isNotInBlackList;
			});

			// Quote identifiers
			if (helpers.isArray(parts.identifiers))
			{
				parts.identifiers.forEach(function(ident) {
					var index = parts.combined.indexOf(ident);
					if (index !== -1)
					{
						parts.combined[index] = driver.quoteIdentifiers(ident);
					}
				});
			}

			// Replace each literal with a placeholder in the map
			// and add the literal to the values,
			// This should only apply to literal values that are not
			// explicitly mapped to values, but have to be parsed from
			// a where condition,
			if (helpers.isArray(parts.literals))
			{
				parts.literals.forEach(function(lit) {
					var litIndex = parts.combined.indexOf(lit);

					if (litIndex !== -1)
					{
						parts.combined[litIndex] = (helpers.isArray(parts.operators)) ? '?' : '= ?';
						outputValues.push(lit);
					}
				});
			}

			outputMap.push(parts.combined.join(' '));
		});

		state.rawWhereValues = [];
		state.whereValues = state.whereValues.concat(outputValues);
		state.whereMap = outputMap;

		return state;
	};
};

module.exports = QueryParser;