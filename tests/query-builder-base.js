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
		// ! Get tests
		'Get tests' : {
			'Get with function': function(test) {
				base.qb.select('id, COUNT(id) as count')
					.from('create_test')
					.groupBy('id')
					.get(base.testCallback.bind(null, test));


			},
			'Basic select all get': function(test) {
				base.qb.get('create_test', base.testCallback.bind(null, test));


			},
			'Basic select all with from': function(test) {
				base.qb.from('create_test')
					.get(base.testCallback.bind(null, test));


			},
			'Get with limit': function(test) {
				base.qb.get('create_test', 2, base.testCallback.bind(null, test));


			},
			'Get with limit and offset': function(test) {
				base.qb.get('create_test', 2, 1, base.testCallback.bind(null, test));


			},
			'Test get with having': function(test) {
				base.qb.select('id')
					.from('create_test')
					.groupBy('id')
					.having({'id >':1})
					.having('id !=', 3)
					.get(base.testCallback.bind(null, test));


			},
			"Test get with 'orHaving'": function(test) {
				base.qb.select('id')
					.from('create_test')
					.groupBy('id')
					.having({'id >':1})
					.orHaving('id !=', 3)
					.get(base.testCallback.bind(null, test));


			}
		},
		// ! Select tests
		'Select tests' : {
			'Select where get': function(test) {
				base.qb.select(['id', 'key as k', 'val'])
					.where('id >', 1)
					.where('id <', 900)
					.get('create_test', 2, 1, base.testCallback.bind(null, test));
			},
			'Select where get 2': function(test) {
				base.qb.select('id, key as k, val')
					.where('id !=', 1)
					.get('create_test', 2, 1, base.testCallback.bind(null, test));
			},
			'Multi Order By': function(test) {
				base.qb.from('create_test')
					.orderBy('id, key')
					.get(base.testCallback.bind(null, test));


			},
			'Select get': function(test) {
				base.qb.select('id, key as k, val')
					.get('create_test', 2, 1, base.testCallback.bind(null, test));


			},
			'Select from get': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test ct')
					.where('id >', 1)
					.get(base.testCallback.bind(null, test));


			},
			'Select from limit get': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test ct')
					.where('id >', 1)
					.limit(3)
					.get(base.testCallback.bind(null, test));


			}
		},
		// ! Grouping tests
		'Grouping tests' : {
			'Using grouping method': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test')
					.groupStart()
					.where('id >', 1)
					.where('id <', 900)
					.groupEnd()
					.limit(2, 1)
					.get(base.testCallback.bind(null, test));


			},
			'Using or grouping method': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test')
					.groupStart()
					.where('id >', 1)
					.where('id <', 900)
					.groupEnd()
					.orGroupStart()
					.where('id', 0)
					.groupEnd()
					.limit(2, 1)
					.get(base.testCallback.bind(null, test));


			},
			'Using or not grouping method': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test')
					.groupStart()
					.where('id >', 1)
					.where('id <', 900)
					.groupEnd()
					.orNotGroupStart()
					.where('id', 0)
					.groupEnd()
					.limit(2, 1)
					.get(base.testCallback.bind(null, test));


			}
		},
		// ! Where in tests
		'Where in tests' : {
			'Where in': function(test) {
				base.qb.from('create_test')
					.whereIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(null, test));


			},
			'Or Where in': function(test) {
				base.qb.from('create_test')
					.where('key', 'false')
					.orWhereIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(null, test));


			},
			'Where Not in': function(test) {
				base.qb.from('create_test')
					.where('key', 'false')
					.whereNotIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(null, test));


			},
			'Or Where Not in': function(test) {
				base.qb.from('create_test')
					.where('key', 'false')
					.orWhereNotIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(null, test));


			}
		},
		// ! Query modifier testss
		'Query modifier tests': {
			'Order By': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test')
					.where('id >', 0)
					.where('id <', 9000)
					.orderBy('id', 'DESC')
					.orderBy('k', "ASC")
					.limit(5, 2)
					.get(base.testCallback.bind(null, test));


			},
			'Group by': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test')
					.where('id >', 0)
					.where('id <', 9000)
					.groupBy('k')
					.groupBy(['id', 'val'])
					.orderBy('id', 'DESC')
					.orderBy('k', "ASC")
					.limit(5, 2)
					.get(base.testCallback.bind(null, test));


			},
			'Or Where': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test')
					.where(' id ', 1)
					.orWhere('key >', 0)
					.limit(2, 1)
					.get(base.testCallback.bind(null, test));


			},
			'Like' : function(test) {
				base.qb.from('create_test')
					.like('key', 'og')
					.get(base.testCallback.bind(null, test));


			},
			'Or Like': function(test) {
				base.qb.from('create_test')
					.like('key', 'og')
					.orLike('key', 'val')
					.get(base.testCallback.bind(null, test));


			},
			'Not Like': function(test) {
				base.qb.from('create_test')
					.like('key', 'og', 'before')
					.notLike('key', 'val')
					.get(base.testCallback.bind(null, test));


			},
			'Or Not Like': function(test) {
				base.qb.from('create_test')
					.like('key', 'og', 'before')
					.orNotLike('key', 'val')
					.get(base.testCallback.bind(null, test));


			},
			'Like Before': function(test) {
				base.qb.from('create_test')
					.like('key', 'og', 'before')
					.get(base.testCallback.bind(null, test));


			},
			'Like After': function(test) {
				base.qb.from('create_test')
					.like('key', 'og', 'after')
					.get(base.testCallback.bind(null, test));


			}/*,
			'Basic Join': function(test) {
				base.qb.from('create_test ct')
					.join('create_join cj', 'cj.id', '=', 'ct.id', 'left')
					.get(base.testCallback.bind(null, test));
			}*/
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