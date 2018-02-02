const fs = require('fs');

/**
 * Various internal helper functions
 *
 * @private
 */
class Helpers {
	/**
	 * Get the contents of a file
	 *
	 * @param {string} file - The path to the file
	 * @return {Promise<string>} - Promise resolving to the contents of the file
	 */
	static readFile (file) {
		return new Promise((resolve, reject) => {
			fs.readFile(file, (err, data) => {
				if (err) {
					return reject(err);
				}
				return resolve(Buffer.from(data).toString());
			});
		});
	}

	/**
	 * Wrap String.prototype.trim in a way that is easily mappable
	 *
	 * @param {String} str - The string to trim
	 * @return {String} - The trimmed string
	 */
	static stringTrim (str) {
		return str.trim();
	}

	/**
	 * Get the type of the variable passed
	 *
	 * @see https://techblog.badoo.com/blog/2013/11/01/type-checking-in-javascript/
	 * @see http://toddmotto.com/understanding-javascript-types-and-reliable-type-checking/
	 * @param {mixed} o - Object to type check
	 * @return {String} - Type of the object
	 */
	static type (o) {
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
	}

	/**
	 * Determine whether an object is scalar
	 *
	 * @param {mixed} obj - Object to test
	 * @return {bool} - Is object scalar
	 */
	static isScalar (obj) {
		let scalar = ['string', 'number', 'boolean'];
		return scalar.indexOf(Helpers.type(obj)) !== -1;
	}

	/**
	 * Get a list of values with a common key from an array of objects
	 *
	 * @param {Array} arr - The array of objects to search
	 * @param {String} key - The key of the object to get
	 * @return {Array} - The new array of plucked values
	 */
	static arrayPluck (arr, key) {
		let output = [];

		// Empty case
		if (arr.length === 0) {
			return output;
		}

		arr.forEach(obj => {
			if (!Helpers.isUndefined(obj[key])) {
				output.push(obj[key]);
			}
		});

		return output;
	}

	/**
	 * Determine if a value matching the passed regular expression is
	 * in the passed array
	 *
	 * @param {Array} arr - The array to search
	 * @param {RegExp} pattern - The pattern to match
	 * @return {Boolean} - If an array item matches the pattern
	 */
	static regexInArray (arr, pattern) {
		// Empty case(s)
		if (!Helpers.isArray(arr) || arr.length === 0) {
			return false;
		}

		const l = arr.length;
		for (let i = 0; i < l; i++) {
			// Short circuit if any items match
			if (pattern.test(arr[i])) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Make the first letter of the string uppercase
	 *
	 * @param {String} str - The string to modify
	 * @return {String} - The modified string
	 */
	static upperCaseFirst (str) {
		str += '';
		let first = str.charAt(0).toUpperCase();
		return first + str.substr(1);
	}
}

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
	'Promise'
];
types.forEach(t => {
	/**
	 * Determine whether a variable is of the type specified in the
	 * function name, eg isNumber
	 *
	 * Types available are Null, Undefined, Object, Array, String, Number,
	 * Boolean, Function, RegExp, NaN, Infinite, Promise
	 *
	 * @private
	 * @param {mixed} o - The object to check its type
	 * @return {Boolean} - If the type matches
	 */
	Helpers[`is${t}`] = function (o) {
		if (t.toLowerCase() === 'infinite') {
			t = 'infinity';
		}

		return Helpers.type(o) === t.toLowerCase();
	};
});

module.exports = Helpers;
