"use strict";

/** @module helpers */

/** @alias module:helpers */
var h = {
	/**
	 * Wrap String.prototype.trim in a way that is easily mappable
	 *
	 * @param {String} str - The string to trim
	 * @return {String} - The trimmed string
	 */
	stringTrim: function(str) {
		return str.trim();
	},
	/**
	 * Get the type of the variable passed
	 *
	 * @see https://techblog.badoo.com/blog/2013/11/01/type-checking-in-javascript/
	 * @see http://toddmotto.com/understanding-javascript-types-and-reliable-type-checking/
	 * @param {mixed} o
	 * @return {String}
	 */
	type: function (o) {
	    var type = Object.prototype.toString.call(o).slice(8, -1).toLowerCase();

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
	 * @param {mixed} obj
	 * @return {bool}
	 */
	isScalar: function(obj) {
		var scalar = ['string', 'number', 'boolean'];
		return scalar.indexOf(h.type(obj)) !== -1;
	},
	/**
	 * Get a list of values with a common key from an array of objects
	 *
	 * @param {Array} arr - The array of objects to search
	 * @param {String} key - The key of the object to get
	 * @return {Array}
	 */
	arrayPluck: function(arr, key) {
		var output = [];

		// Empty case
		if (arr.length === 0) return output;

		arr.forEach(function(obj) {
			if ( ! h.isUndefined(obj[key]))
			{
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
	regexInArray: function(arr, pattern) {
		// Empty case(s)
		if ( ! h.isArray(arr)) return false;
		if (arr.length === 0) return false;

		var i, l = arr.length;

		for(i=0; i< l; i++)
		{
			// Short circuit if any items match
			if (pattern.test(arr[i])) return true;
		}

		return false;
	}
};

// Define an 'is' method for each type
var types = ['Null','Undefined','Object','Array','String','Number','Boolean','Function','RegExp','NaN','Infinite'];
types.forEach(function (t) {
	/**
	 * Determine whether a variable is of the type specified in the
	 * function name, eg isNumber
	 *
	 * Types available are Null, Undefined, Object, Array, String, Number, Boolean, Function, RegExp, NaN and Infinite
	 *
	 * @name is[type]
	 * @param {mixed} o
	 * @return {Boolean}
	 */
    h['is' + t] = function (o) {
	    if (t.toLowerCase() === 'infinite')
	    {
		    t = 'infinity';
	    }

        return h.type(o) === t.toLowerCase();
    };
});

module.exports = h;