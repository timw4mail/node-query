'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// --------------------------------------------------------------------------

/**
 * @constructor
 * @param {Driver} - The driver object for the database in use
 * @module query-parser
 */
module.exports = (function () {
	/**
  * @constructor
  * @param {Driver} - The driver object for the database in use
  * @return {void}
  */

	function QueryParser(driver) {
		_classCallCheck(this, QueryParser);

		this.driver = driver;

		var matchPatterns = {
			'function': /([a-z0-9_]+\((.*)\))/i,
			operator: /\!=?|\=|\+|&&?|~|\|\|?|\^|\/|<>|>=?|<=?|\-|%|OR|AND|NOT|XOR/ig,
			literal: /([0-9]+)|'(.*?)'|true|false/ig
		};

		// Full pattern for identifiers
		// Making sure that literals and functions aren't matched
		matchPatterns.identifier = new RegExp('(' + '(?!' + matchPatterns['function'].source + '|' + matchPatterns.literal.source + ')' + '([a-z_\-]+[0-9]*\\.?)' + ')+', 'ig');

		// Full pattern for determining ordering of the pieces
		matchPatterns.joinCombined = new RegExp(matchPatterns['function'].source + "+|" + matchPatterns.literal.source + '+|' + matchPatterns.identifier.source + '|(' + matchPatterns.operator.source + ')+', 'ig');

		this.matchPatterns = matchPatterns;
		this.identifierBlacklist = ['true', 'false', 'null'];
	}

	/**
  * Filter matched patterns
  *
  * @param {Array} array
  * @return {Array|null}
  */

	_createClass(QueryParser, [{
		key: 'filterMatches',
		value: function filterMatches(array) {
			var output = [];

			// Return non-array matches
			if (_helpers2.default.isNull(array)) return null;
			if (_helpers2.default.isScalar(array) || _helpers2.default.isUndefined(array)) return output;

			array.forEach(function (item) {
				output.push(item);
			});
			return output;
		}

		/**
   * Check if the string contains an operator, and if so, return the operator(s).
   * If there are no matches, return null
   *
   * @param {String} string - the string to check
   * @return {Array|null}
   */

	}, {
		key: 'hasOperator',
		value: function hasOperator(string) {
			return this.filterMatches(string.match(this.matchPatterns.operator));
		}

		/**
   * Tokenize the sql into parts for additional processing
   *
   * @param {String} sql
   * @return {Object}
   */

	}, {
		key: 'parseJoin',
		value: function parseJoin(sql) {
			var _this = this;

			var matches = {};
			var output = {
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
			Object.keys(matches).forEach(function (key) {
				output[key] = _this.filterMatches(matches[key]);
			});

			return output;
		}

		/**
   * Return the output of the parsing of the join condition
   *
   * @param {String} condition - The join condition to evalate
   * @return {String} - The parsed/escaped join condition
   */

	}, {
		key: 'compileJoin',
		value: function compileJoin(condition) {
			var _this2 = this;

			var parts = this.parseJoin(condition);
			var count = parts.identifiers.length;
			var i = undefined;

			// Quote the identifiers
			parts.combined.forEach(function (part, i) {
				if (parts.identifiers.indexOf(part) !== -1 && !_helpers2.default.isNumber(part)) {
					parts.combined[i] = _this2.driver.quoteIdentifiers(part);
				}
			});

			return parts.combined.join(' ');
		}

		/**
   * Parse a where clause to separate functions from values
   *
   * @param {Driver} driver
   * @param {State} state
   * @return {String} - The parsed/escaped where condition
   */

	}, {
		key: 'parseWhere',
		value: function parseWhere(driver, state) {
			var _this3 = this;

			var whereMap = state.whereMap;
			var whereValues = state.rawWhereValues;

			var outputMap = [];
			var outputValues = [];

			Object.keys(whereMap).forEach(function (key) {
				// Combine fields, operators, functions and values into a full clause
				// to have a common starting flow
				var fullClause = '';

				// Add an explicit = sign where one is inferred
				if (!_this3.hasOperator(key)) {
					fullClause = key + ' = ' + whereMap[key];
				} else if (whereMap[key] === key) {
					fullClause = key;
				} else {
					fullClause = key + ' ' + whereMap[key];
				}

				// Separate the clause into separate pieces
				var parts = _this3.parseJoin(fullClause);

				// Filter explicit literals from lists of matches
				if (whereValues.indexOf(whereMap[key]) !== -1) {
					var value = whereMap[key];
					var identIndex = _helpers2.default.isArray(parts.identifiers) ? parts.identifiers.indexOf(value) : -1;
					var litIndex = _helpers2.default.isArray(parts.literals) ? parts.literals.indexOf(value) : -1;
					var combIndex = _helpers2.default.isArray(parts.combined) ? parts.combined.indexOf(value) : -1;
					var funcIndex = _helpers2.default.isArray(parts.functions) ? parts.functions.indexOf(value) : -1;
					var inOutputArray = outputValues.indexOf(value) !== -1;

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
					if (combIndex !== -1) {
						// Make sure to skip functions when replacing values
						if (funcIndex === -1) {
							parts.combined[combIndex] = '?';

							if (!inOutputArray) {
								outputValues.push(value);
								inOutputArray = true;
							}
						}
					}
				}

				// Filter false positive identifiers
				parts.identifiers = parts.identifiers || [];
				parts.identifiers = parts.identifiers.filter(function (item) {
					var isInCombinedMatches = parts.combined.indexOf(item) !== -1;
					var isNotInBlackList = _this3.identifierBlacklist.indexOf(item.toLowerCase()) === -1;

					return isInCombinedMatches && isNotInBlackList;
				}, _this3);

				// Quote identifiers
				if (_helpers2.default.isArray(parts.identifiers)) {
					parts.identifiers.forEach(function (ident) {
						var index = parts.combined.indexOf(ident);
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
				if (_helpers2.default.isArray(parts.literals)) {
					parts.literals.forEach(function (lit) {
						var litIndex = parts.combined.indexOf(lit);

						if (litIndex !== -1) {
							parts.combined[litIndex] = _helpers2.default.isArray(parts.operators) ? '?' : '= ?';
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
	}]);

	return QueryParser;
})();
//# sourceMappingURL=QueryParser.js.map
