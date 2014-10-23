/**
 * Polyfills for very handy methods that are standardized, but not fully implemented in Javascript engines
 */
module.exports = (function() {
	if (!Array.prototype.fill) {
		Array.prototype.fill = function(value) {
			// Steps 1-2.
			if (this == null) {
				throw new TypeError('this is null or not defined');
			}

			var O = Object(this);

			// Steps 3-5.
			var len = O.length >>> 0;

			// Steps 6-7.
			var start = arguments[1];
			var relativeStart = start >> 0;

			// Step 8.
			var k = relativeStart < 0 ?
				Math.max(len + relativeStart, 0) :
				Math.min(relativeStart, len);

			// Steps 9-10.
			var end = arguments[2];
			var relativeEnd = end === undefined ?
				len : end >> 0;

			// Step 11.
			var final = relativeEnd < 0 ?
				Math.max(len + relativeEnd, 0) :
				Math.min(relativeEnd, len);

			// Step 12.
			while (k < final) {
				O[k] = value;
				k++;
			}

			// Step 13.
			return O;
		};
	}

	if ( !String.prototype.contains ) {
		String.prototype.contains = function() {
			return String.prototype.indexOf.apply( this, arguments ) !== -1;
		};
	}

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
}());