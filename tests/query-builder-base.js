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
			},
			'Get with limit': function(test) {
				base.qb.get('create_test', 2, base.testCallback.bind(test, test));
				test.done();
			},
			'Get with limit and offset': function(test) {
				base.qb.get('create_test', 2, 1, base.testCallback.bind(test, test));
				test.done();
			},
			'Test get with having': function(test) {
				base.qb.select('id')
					.from('create_test')
					.groupBy('id')
					.having({'id >':1})
					.having('id !=', 3)
					.get(base.testCallback.bind(test, test));

				test.done();
			},
			"Test get with 'orHaving'": function(test) {
				base.qb.select('id')
					.from('create_test')
					.groupBy('id')
					.having({'id >':1})
					.orHaving('id !=', 3)
					.get(base.testCallback.bind(test, test));

				test.done();
			}
		},
		'Select tests' : {
			'Select where get': function(test) {
				base.qb.select(['id', 'key as k', 'val'])
					.where('id >', 1)
					.where('id <', 900)
					.get('create_test', 2, 1, base.testCallback.bind(test, test));

				base.qb.select('id, key as k, val')
					.where('id !=', 1)
					.get('create_test', 2, 1, base.testCallback.bind(test, test));

				test.done();
			},
			'Multi Order By': function(test) {
				base.qb.from('create_test')
					.orderBy('id, key')
					.get(base.testCallback.bind(test, test));

				test.done();
			}
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