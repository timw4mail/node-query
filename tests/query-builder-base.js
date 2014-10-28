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
		setUp: function(callback) {
			var sql = base.qb.driver.truncate('create_test');
			base.qb.adapter.execute(sql, function(err, result) {
				if (err) {
					throw new Error(err);
				}

				callback();
			});
		},
		// ! Get tests
		'Get tests' : {
			'Get with function': function(test) {
				base.qb.select('id, COUNT(id) as count')
					.from('create_test')
					.groupBy('id')
					.get(base.testCallback.bind(this, test));
			},
			'Basic select all get': function(test) {
				base.qb.get('create_test', base.testCallback.bind(this, test));
			},
			'Basic select all with from': function(test) {
				base.qb.from('create_test')
					.get(base.testCallback.bind(this, test));
			},
			'Get with limit': function(test) {
				base.qb.get('create_test', 2, base.testCallback.bind(this, test));
			},
			'Get with limit and offset': function(test) {
				base.qb.get('create_test', 2, 1, base.testCallback.bind(this, test));
			},
			'Test get with having': function(test) {
				base.qb.select('id')
					.from('create_test')
					.groupBy('id')
					.having({'id >':1})
					.having('id !=', 3)
					.get(base.testCallback.bind(this, test));
			},
			"Test get with 'orHaving'": function(test) {
				base.qb.select('id')
					.from('create_test')
					.groupBy('id')
					.having({'id >':1})
					.orHaving('id !=', 3)
					.get(base.testCallback.bind(this, test));
			}
		},
		// ! Select tests
		'Select tests' : {
			'Select where get': function(test) {
				base.qb.select(['id', 'key as k', 'val'])
					.where('id >', 1)
					.where('id <', 900)
					.get('create_test', 2, 1, base.testCallback.bind(this, test));
			},
			'Select where get 2': function(test) {
				base.qb.select('id, key as k, val')
					.where('id !=', 1)
					.get('create_test', 2, 1, base.testCallback.bind(this, test));
			},
			'Multi Order By': function(test) {
				base.qb.from('create_test')
					.orderBy('id, key')
					.get(base.testCallback.bind(this, test));
			},
			'Select get': function(test) {
				base.qb.select('id, key as k, val')
					.get('create_test', 2, 1, base.testCallback.bind(this, test));
			},
			'Select from get': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test ct')
					.where('id >', 1)
					.get(base.testCallback.bind(this, test));
			},
			'Select from limit get': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test ct')
					.where('id >', 1)
					.limit(3)
					.get(base.testCallback.bind(this, test));
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
					.get(base.testCallback.bind(this, test));
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
					.get(base.testCallback.bind(this, test));
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
					.get(base.testCallback.bind(this, test));
			}
		},
		// ! Where in tests
		'Where in tests' : {
			'Where in': function(test) {
				base.qb.from('create_test')
					.whereIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(this, test));
			},
			'Or Where in': function(test) {
				base.qb.from('create_test')
					.where('key', 'false')
					.orWhereIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(this, test));
			},
			'Where Not in': function(test) {
				base.qb.from('create_test')
					.where('key', 'false')
					.whereNotIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(this, test));
			},
			'Or Where Not in': function(test) {
				base.qb.from('create_test')
					.where('key', 'false')
					.orWhereNotIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(this, test));
			}
		},
		// ! Query modifier tests
		'Query modifier tests': {
			'Order By': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test')
					.where('id >', 0)
					.where('id <', 9000)
					.orderBy('id', 'DESC')
					.orderBy('k', "ASC")
					.limit(5, 2)
					.get(base.testCallback.bind(this, test));
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
					.get(base.testCallback.bind(this, test));
			},
			'Or Where': function(test) {
				base.qb.select('id, key as k, val')
					.from('create_test')
					.where(' id ', 1)
					.orWhere('key >', 0)
					.limit(2, 1)
					.get(base.testCallback.bind(this, test));
			},
			'Like' : function(test) {
				base.qb.from('create_test')
					.like('key', 'og')
					.get(base.testCallback.bind(this, test));
			},
			'Or Like': function(test) {
				base.qb.from('create_test')
					.like('key', 'og')
					.orLike('key', 'val')
					.get(base.testCallback.bind(this, test));
			},
			'Not Like': function(test) {
				base.qb.from('create_test')
					.like('key', 'og', 'before')
					.notLike('key', 'val')
					.get(base.testCallback.bind(this, test));
			},
			'Or Not Like': function(test) {
				base.qb.from('create_test')
					.like('key', 'og', 'before')
					.orNotLike('key', 'val')
					.get(base.testCallback.bind(this, test));
			},
			'Like Before': function(test) {
				base.qb.from('create_test')
					.like('key', 'og', 'before')
					.get(base.testCallback.bind(this, test));
			},
			'Like After': function(test) {
				base.qb.from('create_test')
					.like('key', 'og', 'after')
					.get(base.testCallback.bind(this, test));
			},
			'Basic Join': function(test) {
				base.qb.from('create_test ct')
					.join('create_join cj', 'cj.id=ct.id')
					.get(base.testCallback.bind(this, test));
			},
			'Left Join': function(test) {
				base.qb.from('create_test ct')
					.join('create_join cj', 'cj.id=ct.id', 'left')
					.get(base.testCallback.bind(this, test));
			},
			'InnerJoin': function(test) {
				base.qb.from('create_test ct')
					.join('create_join cj', 'cj.id=ct.id', 'inner')
					.get(base.testCallback.bind(this, test));
			}
		},
		// ! DB Update test
		'DB update tests' : {
			'Test Insert': function(test) {
				base.qb.set('id', 98)
					.set('key', 84)
					.set('val', 120)
					.insert('create_test', base.testCallback.bind(this, test));
			},
			'Test Insert Object': function(test) {
				base.qb.insert('create_test', {
					id: 587,
					key: 1,
					val: 2
				}, base.testCallback.bind(this, test));
			},
			'Test Update': function(test) {
				base.qb.where('id', 7)
					.update('create_test', {
						id: 7,
						key: 'gogle',
						val: 'non-word'
					}, base.testCallback.bind(this, test));
			},
			'Test set Array Update': function(test) {
				var object = {
					id: 22,
					key: 'gogle',
					val: 'non-word'
				};

				base.qb.set(object)
					.where('id', 22)
					.update('create_test', base.testCallback.bind(this, test));
			},
			'Test where set update': function(test) {
				base.qb.where('id', 36)
					.set('id', 36)
					.set('key', 'gogle')
					.set('val', 'non-word')
					.update('create_test', base.testCallback.bind(this, test));
			},
			'Test delete': function(test) {
				base.qb.delete('create_test', {id: 5}, base.testCallback.bind(this, test));
			}
		},
		// ! Compiled query tests
		'Compiled query tests' : {

		}
	};

	return base;
}());