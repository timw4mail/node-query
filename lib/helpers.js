'use strict';

/**
 * Various internal helper functions
 *
 * @private
 */
let helpers = {
	/**
	 * Wrap String.prototype.trim in a way that is easily mappable
	 *
	 * @param {String} str - The string to trim
	 * @return {String} - The trimmed string
	 */
	stringTrim: str => str.trim(),
	/**
	 * Get the type of the variable passed
	 *
	 * @see https://techblog.badoo.com/blog/2013/11/01/type-checking-in-javascript/
	 * @see http://toddmotto.com/understanding-javascript-types-and-reliable-type-checking/
	 * @param {mixed} o - Object to type check
	 * @return {String} - Type of the object
	 */
	type: o => {
		let type = Object.prototype.toString.call(o).slice(8, -1).toLowerCase();

		// handle NaN and Infinity
		if (type === 'number') {
			if (isNaN(o)) {
				return 'nan';
			}

			if (!isFinite(o)) {
				return 'infinity';
			}
		}

		return type;
	},
	/**
	 * Determine whether an object is scalar
	 *
	 * @param {mixed} obj - Object to test
	 * @return {bool} - Is object scalar
	 */
	isScalar: obj => {
		let scalar = ['string', 'number', 'boolean'];
		return scalar.indexOf(helpers.type(obj)) !== -1;
	},
	/**
	 * Get a list of values with a common key from an array of objects
	 *
	 * @param {Array} arr - The array of objects to search
	 * @param {String} key - The key of the object to get
	 * @return {Array} - The new array of plucked values
	 */
	arrayPluck: (arr, key) => {
		let output = [];

		// Empty case
		if (arr.length === 0) {
			return output;
		}

		arr.forEach(obj => {
			if (! helpers.isUndefined(obj[key])) {
				output.push(obj[key]);
			}
		});

		return output;
	},
	/**
	 * Determine if a value matching the passed regular expression is
	 * in the passed array
	 *
	 * @param {Array} arr - The array to search
	 * @param {RegExp} pattern - The pattern to match
	 * @return {Boolean} - If an array item matches the pattern
	 */
	regexInArray: (arr, pattern) => {
		// Empty case(s)
		if (! helpers.isArray(arr) || arr.length === 0) {
			return false;
		}

		let i, l = arr.length;

		for (i = 0; i < l; i++) {
			// Short circuit if any items match
			if (pattern.test(arr[i])) {
				return true;
			}
		}

		return false;
	},
	/**
	 * Make the first letter of the string uppercase
	 *
	 * @param {String} str - The string to modify
	 * @return {String} - The modified string
	 */
	upperCaseFirst: str => {
		str += '';
		let first = str.charAt(0).toUpperCase();
		return first + str.substr(1);
	},
};

// Define an 'is' method for each type
let types = [
	'Null',
	'Undefined',
	'Object',
	'Array',
	'String',
	'Number',
	'Boolean',
	'Function',
	'RegExp',
	'NaN',
	'Infinite',
];
types.forEach(t => {
	/**
	 * Determine whether a variable is of the type specified in the
	 * function name, eg isNumber
	 *
	 * Types available are Null, Undefined, Object, Array, String, Number, Boolean, Function, RegExp, NaN and Infinite
	 *
	 * @private
	 * @param {mixed} o - The object to check its type
	 * @return {Boolean} - If the type matches
	 */
    helpers[`is${t}`] = function(o) {
		if (t.toLowerCase() === 'infinite') {
			t = 'infinity';
		}

        return helpers.type(o) === t.toLowerCase();
    };
});

module.exports = helpers;