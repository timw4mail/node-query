/** @module helpers */

"use strict";

if (!String.prototype.startsWith) {
	Object.defineProperty(String.prototype, 'startsWith', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function (searchString, position) {
			position = position || 0;
			return this.lastIndexOf(searchString, position) === position;
		}
	});
}

if (!String.prototype.endsWith) {
	Object.defineProperty(String.prototype, 'endsWith', {
		value: function (searchString, position) {
			var subjectString = this.toString();
			if (position === undefined || position > subjectString.length) {
				position = subjectString.length;
			}
			position -= searchString.length;
			var lastIndex = subjectString.indexOf(searchString, position);
			return lastIndex !== -1 && lastIndex === position;
		}
	});
}

module.exports = {
	/**
	 * Split a string by a character, trim the string
	 * and rejoin the string
	 *
	 * @param {String} char
	 * @param {String} string
	 * @return {String}
	 */
	splitTrim: function(char, string) {
		return string.split(char).map(String.trim).join(char);
	},
	/**
	 * Determine whether an object is a string
	 * @param {mixed} obj
	 * @return {bool}
	 */
	isString: function(obj) {
		return (typeof obj === 'string' || obj instanceof String);
	},
	/**
	 * Determine whether an object is numeric
	 * @param {mixed} obj
	 * @return {bool}
	 */
	isNumber: function(obj) {
		return ! isNaN(parseFloat(obj)) && isFinite(obj);
	}
};
