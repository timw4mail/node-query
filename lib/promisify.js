'use strict';

/*eslint-disable prefer-arrow-callback*/
/**
 * Function to convert a callback function into a promise
 *
 * @private
 * @see http://eddmann.com/posts/promisifying-error-first-asynchronous-callbacks-in-javascript/
 * @example promisify(fs.readFile)('hello.txt', 'utf8')
 *	.then(console.log)
 *	.catch(console.error)
 * @param	{Function} fn - the callback function to convert
 * @return {Promise} - the new promise
 */
function promisify(fn) {
	return function () {
		let args = [].slice.call(arguments);
		return new Promise(function (resolve, reject) {
			fn.apply(undefined, args.concat((error, value) => {
				return error ? reject(error) : resolve(value);
			}));
		});
	};
}

module.exports = promisify;
/*eslint-enable prefer-arrow-callback*/