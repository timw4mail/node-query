'use strict';

var helpers = require('../lib/helpers');
var State = require('../lib/state');

module.exports = (function QueryBuilderTestBase()  {

	// That 'new' keyword is annoying
	if ( ! (this instanceof QueryBuilderTestBase)) return new QueryBuilderTestBase();

	var base = {};

	/**
	 * Inject the appropriate driver and adapter for the test suite
	 *
	 * @param {Object} qb - The adapter-specific query builder object
	 * @param {Function} callback - The test callback
	 * @return void
	 */
	this._setUp = function(qb, callback) {
		base.qb = qb;
		base.testCallback = callback;

		this.qb = base.qb;
	};

	/**
	 * Generic query builder tests
	 */
	this.tests = {
		// ! Get tests
		'Get tests' : {
			'Get with function': function(test) {
				test.expect(1);
				base.qb.select('id, COUNT(id) as count')
					.from('create_test')
					.groupBy('id')
					.get(base.testCallback.bind(this, test));
			},
			'Basic select all get': function(test) {
				test.expect(1);
				base.qb.get('create_test', base.testCallback.bind(this, test));
			},
			'Basic select all with from': function(test) {
				test.expect(1);
				base.qb.from('create_test')
					.get(base.testCallback.bind(this, test));
			},
			'Get with limit': function(test) {
				test.expect(1);
				base.qb.get('create_test', 2, base.testCallback.bind(this, test));
			},
			'Get with limit and offset': function(test) {
				test.expect(1);
				base.qb.get('create_test', 2, 1, base.testCallback.bind(this, test));
			},
			'Test get with having': function(test) {
				test.expect(1);
				base.qb.select('id')
					.from('create_test')
					.groupBy('id')
					.having({'id >':1})
					.having('id !=', 3)
					.having('id', 900)
					.get(base.testCallback.bind(this, test));
			},
			"Test get with 'orHaving'": function(test) {
				test.expect(1);
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
				test.expect(1);
				base.qb.select(['id', 'key as k', 'val'])
					.where('id >', 1)
					.where('id <', 900)
					.get('create_test', 2, 1, base.testCallback.bind(this, test));
			},
			'Select where get 2': function(test) {
				test.expect(1);
				base.qb.select('id, key as k, val')
					.where('id !=', 1)
					.get('create_test', 2, 1, base.testCallback.bind(this, test));
			},
			'Multi Order By': function(test) {
				test.expect(1);
				base.qb.from('create_test')
					.orderBy('id, key')
					.get(base.testCallback.bind(this, test));
			},
			'Select get': function(test) {
				test.expect(1);
				base.qb.select('id, key as k, val')
					.get('create_test', 2, 1, base.testCallback.bind(this, test));
			},
			'Select from get': function(test) {
				test.expect(1);
				base.qb.select('id, key as k, val')
					.from('create_test ct')
					.where('id >', 1)
					.get(base.testCallback.bind(this, test));
			},
			'Select from limit get': function(test) {
				test.expect(1);
				base.qb.select('id, key as k, val')
					.from('create_test ct')
					.where('id >', 1)
					.limit(3)
					.get(base.testCallback.bind(this, test));
			},
			'Select where IS NOT NULL': function(test) {
				test.expect(1);
				base.qb.select('id', 'key as k', 'val')
					.from('create_test ct')
					.whereIsNotNull('id')
					.get(base.testCallback.bind(this, test));
			},
			'Select where IS NULL': function(test) {
				test.expect(1);
				base.qb.select('id', 'key as k', 'val')
					.from('create_test ct')
					.whereIsNull('id')
					.get(base.testCallback.bind(this, test));
			},
			'Select where OR IS NOT NULL': function(test) {
				test.expect(1);
				base.qb.select('id', 'key as k', 'val')
					.from('create_test ct')
					.whereIsNull('id')
					.orWhereIsNotNull('id')
					.get(base.testCallback.bind(this, test));
			},
			'Select where OR IS NULL': function(test) {
				test.expect(1);
				base.qb.select('id', 'key as k', 'val')
					.from('create_test ct')
					.where('id', 3)
					.orWhereIsNull('id')
					.get(base.testCallback.bind(this, test));
			},
			'Select with string where value': function(test) {
				test.expect(1);
				base.qb.select('id','key as k', 'val')
					.from('create_test ct')
					.where('id > 3')
					.get(base.testCallback.bind(this, test));
			},
			/*'Select with function in WHERE clause': function(test) {
				test.expect(1);
				base.qb.select('id', 'key as k', 'val')
					.from('create_test')
					.where('val !=', 'CURRENT_TIMESTAMP()')
					.get(base.testCallback.bind(this, test));
			},*/
			'Select with function and argument in WHERE clause': function(test) {
				test.expect(1);
				base.qb.select('id')
					.from('create_test')
					.where('id', 'CEILING(SQRT(88))')
					.get(base.testCallback.bind(this, test));
			}
		},
		// ! Grouping tests
		'Grouping tests' : {
			'Using grouping method': function(test) {
				test.expect(1);
				base.qb.select('id, key as k, val')
					.from('create_test')
					.groupStart()
					.where('id >', 1)
					.where('id <', 900)
					.groupEnd()
					.limit(2, 1)
					.get(base.testCallback.bind(this, test));
			},
			'Using where first grouping': function(test) {
				test.expect(1);
				base.qb.select('id, key as k, val')
					.from('create_test')
					.where('id !=', 5)
					.groupStart()
					.where('id >', 1)
					.where('id <', 900)
					.groupEnd()
					.limit(2, 1)
					.get(base.testCallback.bind(this, test));
			},
			'Using or grouping method': function(test) {
				test.expect(1);
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
				test.expect(1);
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
				test.expect(1);
				base.qb.from('create_test')
					.whereIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(this, test));
			},
			'Or Where in': function(test) {
				test.expect(1);
				base.qb.from('create_test')
					.where('key', 'false')
					.orWhereIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(this, test));
			},
			'Where Not in': function(test) {
				test.expect(1);
				base.qb.from('create_test')
					.where('key', 'false')
					.whereNotIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(this, test));
			},
			'Or Where Not in': function(test) {
				test.expect(1);
				base.qb.from('create_test')
					.where('key', 'false')
					.orWhereNotIn('id', [0, 6, 56, 563, 341])
					.get(base.testCallback.bind(this, test));
			}
		},
		// ! Query modifier tests
		'Query modifier tests': {
			'Order By': function(test) {
				test.expect(1);
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
				test.expect(1);
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
				test.expect(1);
				base.qb.select('id, key as k, val')
					.from('create_test')
					.where(' id ', 1)
					.orWhere('key >', 0)
					.limit(2, 1)
					.get(base.testCallback.bind(this, test));
			},
			'Like' : function(test) {
				test.expect(1);
				base.qb.from('create_test')
					.like('key', 'og')
					.get(base.testCallback.bind(this, test));
			},
			'Or Like': function(test) {
				test.expect(1);
				base.qb.from('create_test')
					.like('key', 'og')
					.orLike('key', 'val')
					.get(base.testCallback.bind(this, test));
			},
			'Not Like': function(test) {
				test.expect(1);
				base.qb.from('create_test')
					.like('key', 'og', 'before')
					.notLike('key', 'val')
					.get(base.testCallback.bind(this, test));
			},
			'Or Not Like': function(test) {
				test.expect(1);
				base.qb.from('create_test')
					.like('key', 'og', 'before')
					.orNotLike('key', 'val')
					.get(base.testCallback.bind(this, test));
			},
			'Like Before': function(test) {
				test.expect(1);
				base.qb.from('create_test')
					.like('key', 'og', 'before')
					.get(base.testCallback.bind(this, test));
			},
			'Like After': function(test) {
				test.expect(1);
				base.qb.from('create_test')
					.like('key', 'og', 'after')
					.get(base.testCallback.bind(this, test));
			},
			'Basic Join': function(test) {
				test.expect(1);
				base.qb.from('create_test ct')
					.join('create_join cj', 'cj.id=ct.id')
					.get(base.testCallback.bind(this, test));
			},
			'Left Join': function(test) {
				test.expect(1);
				base.qb.from('create_test ct')
					.join('create_join cj', 'cj.id=ct.id', 'left')
					.get(base.testCallback.bind(this, test));
			},
			'InnerJoin': function(test) {
				test.expect(1);
				base.qb.from('create_test ct')
					.join('create_join cj', 'cj.id=ct.id', 'inner')
					.get(base.testCallback.bind(this, test));
			},
			'Join with multiple where values': function(test) {
				test.expect(1);
				base.qb.from('create_test ct')
					.join('create_join cj', 'cj.id=ct.id', 'inner')
					.where({
						'ct.id <': 3,
						'ct.key': 'foo'
					})
					.get(base.testCallback.bind(this, test));
			}
		},
		// ! DB Update test
		'DB update tests' : {
			setUp: function(callback) {
				var sql = base.qb.driver.truncate('create_test');
				base.qb.adapter.execute(sql, function(err, result) {
					if (err) {
						throw new Error(err);
					}

					callback();
				});
			},
			tearDown: function(callback) {
				callback();
			},
			'Test Insert': function(test) {
				test.expect(1);
				base.qb.set('id', 98)
					.set('key', "84")
					.set('val', new Buffer("120"))
					.insert('create_test', base.testCallback.bind(this, test));
			},
			'Test Insert Object': function(test) {
				test.expect(1);
				base.qb.insert('create_test', {
					id: 587,
					key: 1,
					val: new Buffer('2')
				}, base.testCallback.bind(this, test));
			},
			'Test Insert Batch': function(test) {
				test.expect(1);
				var data = [{
					id: 544,
					key: 3,
					val: new Buffer('7')
				}, {
					id: 89,
					key: 34,
					val: new Buffer("10 o'clock")
				}, {
					id: 48,
					key: 403,
					val: new Buffer('97')
				}];

				base.qb.insertBatch('create_test', data, base.testCallback.bind(this, test));
			},
			'Test Update': function(test) {
				test.expect(1);
				base.qb.where('id', 7)
					.update('create_test', {
						id: 7,
						key: 'gogle',
						val: new Buffer('non-word')
					}, base.testCallback.bind(this, test));
			},
			'Test set Array Update': function(test) {
				test.expect(1);
				var object = {
					id: 22,
					key: 'gogle',
					val: new Buffer('non-word')
				};

				base.qb.set(object)
					.where('id', 22)
					.update('create_test', base.testCallback.bind(this, test));
			},
			'Test where set update': function(test) {
				test.expect(1);
				base.qb.where('id', 36)
					.set('id', 36)
					.set('key', 'gogle')
					.set('val', new Buffer('non-word'))
					.update('create_test', base.testCallback.bind(this, test));
			},
			'Test delete': function(test) {
				test.expect(1);
				base.qb.delete('create_test', {id: 5}, base.testCallback.bind(this, test));
			},
			'delete with where': function(test) {
				test.expect(1);
				base.qb.where('id', 5)
					.delete('create_test', base.testCallback.bind(this, test));
			},
			'Delete multiple where values': function(test) {
				test.expect(1);
				base.qb.delete('create_test', {
					id: 5,
					key: 'gogle'
				}, base.testCallback.bind(this, test));
			}
		},
		// ! Get compiled tests
		'Get compiled tests' : {
			'select': function(test) {
				test.expect(1);
				var string = base.qb.select('id')
					.from('create_test')
					.getCompiledSelect(true);

				test.equal(true, helpers.isString(string));

				test.done();
			},
			'select from': function(test) {
				test.expect(1);
				var string = base.qb.select('id')
					.getCompiledSelect('create_test', true);

				test.equal(true, helpers.isString(string));

				test.done();
			},
			'insert': function(test) {
				test.expect(1);

				var string = base.qb.set('id', 3)
					.getCompiledInsert('create_test');

				test.equal(true, helpers.isString(string));

				test.done();
			},
			'update': function(test) {
				test.expect(1);

				var string = base.qb.set('id', 3)
					.where('id', 5)
					.getCompiledUpdate('create_test');

				test.equal(true, helpers.isString(string));

				test.done();
			},
			'delete': function(test) {
				test.expect(1);

				var string = base.qb.where('id', 5)
					.getCompiledDelete('create_test');

				test.equal(true, helpers.isString(string));

				test.done();
			}
		},
		// ! Misc tests
		'Misc tests' : {
			'Get State': function(test) {
				test.expect(1);

				base.qb.select('foo')
					.from('bar')
					.where('baz', 'foobar');

				var state = new State();

				test.notDeepEqual(JSON.stringify(state), JSON.stringify(base.qb.getState()));
				test.done();
			},
			'Reset State': function(test) {
				test.expect(1);

				base.qb.select('foo')
					.from('bar')
					.where('baz', 'foobar');

				base.qb.resetQuery();

				var state = new State();

				test.deepEqual(state, base.qb.getState());

				test.done();
			}
		}
	};

	return this;
}());