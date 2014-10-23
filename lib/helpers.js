"use strict";

/** @module helpers */

require('./es6-polyfill');

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
        return h.type(o) === t.toLowerCase();
    };
});

module.exports = h;