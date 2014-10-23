'use strict';

module.exports = (function()  {
	var base = {};

	/**
	 * Inject the appropriate driver and adapter for the test suite
	 *
	 * @param {Object} qb - The adapter-specific query builder object
	 * @param {Function} callback - The test callback
	 * @return void
	 */
	base._setUp = function(qb, callback) {
		base.qb = qb;
		base.testCallback = callback;
	};

	/**
	 * Generic query builder tests
	 */
	base.tests = {
		'Get tests' : {
			'Get with function': function(test) {
				base.qb.select('id, COUNT(id) as count')
					.from('create_test')
					.groupBy('id')
					.get(base.testCallback.bind(test, test));

				test.done();
			},
			'Basic select all get': function(test) {
				base.qb.get('create_test', base.testCallback.bind(test, test));
				test.done();
			},
			'Basic select all with from': function(test) {
				base.qb.from('create_test')
					.get(base.testCallback.bind(test, test));
				test.done();
			}
		},
		'Select tests' : {

		},
		'Grouping tests' : {

		},
		'Where in tests' : {

		},
		'Query modifier tests': {

		},
		'DB update tests' : {

		},
		'Compiled query tests' : {

		},
		'Error tests' : {

		}
	};

	return base;
}());