const XRegExp = require('xregexp');
const Helpers = require('./Helpers');

// --------------------------------------------------------------------------

/**
 * Internal object for parsing query fragments
 *
 * @private
 * @param {Driver} driver - The driver object for the database in use
 */
class QueryParser {
	/**
	 * @constructor
	 *
	 * @param {Driver} driver - The driver object for the database in use
	 * @return {void}
	 */
	constructor (driver) {
		this.driver = driver;

		const matchPatterns = {
			function: /([a-z0-9_]+\((.*)\))/i,
			operator: /!=?|=|\+|&&?|~|\|\|?|\^|\/|<>|>=?|<=?|-|%|OR|AND|NOT|XOR/ig,
			literal: /([0-9]+)|'(.*?)'|true|false/ig
		};

		// Full pattern for identifiers
		// Making sure that literals and functions aren't matched
		matchPatterns.identifier = XRegExp(
			`(
				(?!
					${matchPatterns['function'].source}|
					${matchPatterns.literal.source}
				)
				([a-z_-]+[0-9]*\\.?)
			)+`, 'igx');

		// Full pattern for determining ordering of the pieces
		matchPatterns.joinCombined = XRegExp(
			`${matchPatterns['function'].source}+|	# functions
			${matchPatterns.literal.source}+|	# literal values
			${matchPatterns.identifier.source}	# identifiers
			|(${matchPatterns.operator.source})+`, 'igx');

		this.matchPatterns = matchPatterns;
		this.identifierBlacklist = ['true', 'false', 'null'];
	}

	/**
	 * Filter matched patterns
	 *
	 * @param {Array} array - Set of possible matches
	 * @return {Array|null} - Filtered set of possible matches
	 */
	filterMatches (array) {
		const output = [];

		// Return non-array matches
		if (Helpers.isNull(array)) {
			return null;
		}

		array.forEach(item => {
			output.push(item);
		});
		return output;
	}

	/**
	 * Check if the string contains an operator, and if so, return the operator(s).
	 * If there are no matches, return null
	 *
	 * @param {String} string - the string to check
	 * @return {Array|null} - List of operators
	 */
	hasOperator (string) {
		return this.filterMatches(string.match(this.matchPatterns.operator));
	}

	/**
	 * Tokenize the sql into parts for additional processing
	 *
	 * @param {String} sql - Join sql to parse
	 * @return {Object} - Join condition components
	 */
	parseJoin (sql) {
		const matches = {};
		const output = {
			functions: [],
			identifiers: [],
			operators: [],
			literals: []
		};

		// Get clause components
		matches.functions = sql.match(new RegExp(this.matchPatterns['function'].source, 'ig'));
		matches.identifiers = sql.match(this.matchPatterns.identifier);
		matches.operators = sql.match(this.matchPatterns.operator);
		matches.literals = sql.match(this.matchPatterns.literal);

		// Get everything at once for ordering
		matches.combined = sql.match(this.matchPatterns.joinCombined);

		// Flatten the matches to increase relevance
		Object.keys(matches).forEach(key => {
			output[key] = this.filterMatches(matches[key]);
		});

		return output;
	}

	/**
	 * Return the output of the parsing of the join condition
	 *
	 * @param {String} condition - The join condition to evaluate
	 * @return {String} - The parsed/escaped join condition
	 */
	compileJoin (condition) {
		const parts = this.parseJoin(condition);

		// Quote the identifiers
		parts.combined.forEach((part, i) => {
			if (parts.identifiers.indexOf(part) !== -1 && !Helpers.isNumber(part)) {
				parts.combined[i] = this.driver.quoteIdentifiers(part);
			}
		});

		return parts.combined.join(' ');
	}

	/**
	 * Parse a where clause to separate functions from values
	 *
	 * @param {Driver} driver - The current db driver
	 * @param {State} state - Query Builder state object
	 * @return {String} - The parsed/escaped where condition
	 */
	parseWhere (driver, state) {
		const whereMap = state.whereMap;
		let	whereValues = state.rawWhereValues;

		const outputMap = [];
		const outputValues = [];

		Object.keys(whereMap).forEach(key => {
			// Combine fields, operators, functions and values into a full clause
			// to have a common starting flow
			let fullClause = '';

			// Add an explicit = sign where one is inferred
			if (!this.hasOperator(key)) {
				fullClause = `${key} = ${whereMap[key]}`;
			} else if (whereMap[key] === key) {
				fullClause = key;
			} else {
				fullClause = `${key} ${whereMap[key]}`;
			}

			// Separate the clause into separate pieces
			const parts = this.parseJoin(fullClause);

			// Filter explicit literals from lists of matches
			if (whereValues.indexOf(whereMap[key]) !== -1) {
				const value = whereMap[key];
				const identIndex = parts.identifiers.indexOf(value);
				const litIndex = (Helpers.isArray(parts.literals)) ? parts.literals.indexOf(value) : -1;
				const combIndex = parts.combined.indexOf(value);
				const funcIndex = (Helpers.isArray(parts.functions)) ? parts.functions.indexOf(value) : -1;
				let inOutputArray = outputValues.includes(value);

				// Remove the identifier in question,
				// and add to the output values array
				if (identIndex !== -1) {
					parts.identifiers.splice(identIndex, 1);

					if (!inOutputArray) {
						outputValues.push(value);
						inOutputArray = true;
					}
				}

				// Remove the value from the literals list
				// so it is not added twice
				if (litIndex !== -1) {
					parts.literals.splice(litIndex, 1);

					if (!inOutputArray) {
						outputValues.push(value);
						inOutputArray = true;
					}
				}

				// Remove the value from the combined list
				// and replace it with a placeholder
				if (combIndex !== -1 && funcIndex === -1) {
					// Make sure to skip functions when replacing values
					parts.combined[combIndex] = '?';
				}
			}

			// Filter false positive identifiers
			parts.identifiers = parts.identifiers.filter(item => {
				const isInCombinedMatches = parts.combined.indexOf(item) !== -1;
				const isNotInBlackList = this.identifierBlacklist.indexOf(item.toLowerCase()) === -1;

				return isInCombinedMatches && isNotInBlackList;
			}, this);

			// Quote identifiers
			if (Helpers.isArray(parts.identifiers)) {
				parts.identifiers.forEach(ident => {
					const index = parts.combined.indexOf(ident);
					if (index !== -1) {
						parts.combined[index] = driver.quoteIdentifiers(ident);
					}
				});
			}

			// Replace each literal with a placeholder in the map
			// and add the literal to the values,
			// This should only apply to literal values that are not
			// explicitly mapped to values, but have to be parsed from
			// a where condition,
			if (Helpers.isArray(parts.literals)) {
				parts.literals.forEach(lit => {
					const litIndex = parts.combined.indexOf(lit);

					if (litIndex !== -1) {
						parts.combined[litIndex] = '?';
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
	}
}

module.exports = QueryParser;
