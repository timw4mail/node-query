"use strict";

module.exports.tests = {
	'Get tests': {
		'Get with function': {
			select: ['id, COUNT(id) as count'],
			from: ['create_test'],
			groupBy: ['id'],
			get : []
		},
		'Basic select all get': {
			get: ['create_test']
		},
		'Basic select all with from': {
			from: ['create_test'],
			get: []
		},
		'Get with limit': {
			get: ['create_test', 2]
		},
		'Get with limit and offset': {
			get: ['create_test', 2, 1]
		},
		'Get with having': {
			select: ['id'],
			from: ['create_test'],
			groupBy: ['id'],
			having: [
				'multiple',
				[{'id >': 1}],
				['id !=', 3],
				['id', 900],
			],
			get: []
		},
		'Get with orHaving': {
			select: ['id'],
			from: ['create_test'],
			groupBy: ['id'],
			having: [{'id >': 1}],
			orHaving: ['id !=', 3],
			get: []
		}
	},
	'Select tests': {
		'Select where get': {
			select: [['id', 'key as k', 'val']],
			where: [
				'multiple',
				['id >', 1],
				['id <', 900]
			],
			get: ['create_test', 2, 1]
		},
		'Select where get 2': {
			select: ['id, key as k, val'],
			where: ['id !=', 1],
			get: ['create_test', 2, 1]
		},
		'Multi Order By': {
			from: ['create_test'],
			orderBy: ['id, key'],
			get: []
		},
		'Select get': {
			select: ['id, key as k, val'],
			get: ['create_test', 2, 1]
		},
		'Select from get': {
			select: ['id, key as k, val'],
			from: ['create_test ct'],
			where: ['id >', 1],
			get: []
		},
		'Select from limit get': {
			select: ['id, key as k, val'],
			from: ['create_test ct'],
			where: ['id >', 1],
			limit: [3],
			get: []
		},
		'Select where IS NOT NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			whereIsNotNull: ['id'],
			get: []
		},
		'Select where IS NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			whereIsNull: ['id'],
			get: []
		},
		'Select where OR IS NOT NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			whereIsNull: ['id'],
			orWhereIsNotNull: ['id'],
			get: []
		},
		'Select where OR IS NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			where: ['id', 3],
			orWhereIsNull: ['id'],
			get: []
		},
		'Select with string where value': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			where: ['id > 3'],
			get: []
		},
		'Select with function and argument in WHERE clause': {
			select: ['id'],
			from: ['create_test ct'],
			where: ['id', 'CEILING(SQRT(88))'],
			get: []
		}
	},
	'Where in tests': {
		'Where in': {
			from: ['create_test'],
			whereIn: ['id', [0, 6, 56, 563, 341]],
			get: []
		},
		'Or Where in': {
			from: ['create_test'],
			where: ['key', 'false'],
			orWhereIn: ['id', [0, 6, 56, 563, 341]],
			get: []
		},
		'Where Not in': {
			from: ['create_test'],
			where: ['key', 'false'],
			whereNotIn: ['id', [0, 6, 56, 563, 341]],
			get: []
		},
		'Or Where Not in': {
			from: ['create_test'],
			where: ['key', 'false'],
			orWhereNotIn: ['id', [0, 6, 56, 563, 341]],
			get: []
		}
	},
	'Query modifier tests': {
		'Order By': {
			select: ['id, key as k, val'],
			from: ['create_test'],
			where: [
				'multiple',
				['id >', 0],
				['id <', 9000]
			],
			orderBy: [
				'multiple',
				['id', 'DESC'],
				['k', "ASC"]
			],
			limit: [5, 2],
			get: []
		},
		'Group By': {
			select: ['id, key as k, val'],
			from: ['create_test'],
			where: [
				'multiple',
				['id >', 0],
				['id <', 9000]
			],
			groupBy: [
				'multiple',
				['k'],
				[['id', 'val']]
			],
			orderBy: [
				'multiple',
				['id', 'DESC'],
				['k', "ASC"]
			],
			limit: [5,2],
			get: []
		},
		'Or Where': {
			select: ['id, key as k, val'],
			from: ['create_test'],
			where: [' id ', 1],
			orWhere: ['key > ', 0],
			limit: [2, 1],
			get: []
		},
		'Like': {
			from: ['create_test'],
			like: ['key', 'og'],
			get: []
		},
		'Or Like': {
			from: ['create_test'],
			like: ['key', 'og'],
			orLike: ['key', 'val'],
			get: []
		},
		'Not Like': {
			from: ['create_test'],
			like: ['key', 'og', 'before'],
			notLike: ['key', 'val'],
			get: []
		},
		'Or Not Like': {
			from: ['create_test'],
			like: ['key', 'og', 'before'],
			orNotLike: ['key', 'val'],
			get: []
		},
		'Like Before': {
			from: ['create_test'],
			like: ['key', 'og', 'before'],
			get: []
		},
		'Like After': {
			from: ['create_test'],
			like: ['key', 'og', 'after'],
			get: []
		},
		'Basic Join': {
			from: ['create_test ct'],
			join: ['create_join cj', 'cj.id=ct.id'],
			get: []
		},
		'Left Join': {
			from: ['create_test ct'],
			join: ['create_join cj', 'cj.id=ct.id', 'left'],
			get: []
		},
		'Inner Join': {
			from: ['create_test ct'],
			join: ['create_join cj', 'cj.id=ct.id', 'inner'],
			get: []
		},
		'Join with multiple where values': {
			from: ['create_test ct'],
			join: ['create_join cj', 'cj.id=ct.id', 'inner'],
			where: [{
				'ct.id < ': 3,
				'ct.key ': 'foo'
			}],
			get: []
		}
	}
};



let expect = require('chai').expect,
	helpers = require('../../lib/helpers'),
	State = require('../../lib/State');

module.exports.runner = (tests, qb, callback) => {
	Object.keys(tests).forEach(suiteName => {
		suite(suiteName, () => {
			let currentSuite = tests[suiteName];
			Object.keys(currentSuite).forEach(testDesc => {
				test(testDesc, done => {
					let methodObj = currentSuite[testDesc];
					let methodNames = Object.keys(methodObj);
					let lastMethodIndex = methodNames[methodNames.length - 1];

					methodObj[lastMethodIndex].push((err, rows) => {
						callback(err, done);
					});

					methodNames.forEach(name => {
						let args = methodObj[name],
							method = qb[name];

						if (args[0] === 'multiple') {
							args.shift();
							args.forEach(argSet => {
								method.apply(qb, argSet);
							});

						} else {
							method.apply(qb, args);
						}
					});
				});
			});
		});
	});
	suite('DB update tests', () => {
		setup(done => {
			let sql = qb.driver.truncate('create_test');
			qb.adapter.execute(sql, (err, res) => {
				done();
			});
		});
		test('Test Insert', done => {
			qb.set('id', 98)
				.set('key', "84")
				.set('val', new Buffer("120"))
				.insert('create_test', (err, rows) => {
					return callback(err, done);
				});
		});
		test('Test Insert Object', done => {
			qb.insert('create_test', {
				id: 587,
				key: 1,
				val: new Buffer('2')
			}, (err, rows) => {
				return callback(err, done);
			});
		});
		test('Test Update', done => {
			qb.where('id', 7)
				.update('create_test', {
					id: 7,
					key: 'gogle',
					val: new Buffer('non-word')
				}, (err, rows) => {
					return callback(err, done);
				});
		});
		test('Test set Array Update', done => {
			let object = {
				id: 22,
				key: 'gogle',
				val: new Buffer('non-word')
			};

			qb.set(object)
				.where('id', 22)
				.update('create_test', (err, rows) => {
					return callback(err, done);
				});
		});
		test('Test where set update', done => {
			qb.where('id', 36)
				.set('id', 36)
				.set('key', 'gogle')
				.set('val', new Buffer('non-word'))
				.update('create_test', (err, rows) => {
					return callback(err, done);
				});
		});
		test('Test delete', done => {
			qb.delete('create_test', {id: 5}, (err, rows) => {
				return callback(err, done);
			});
		});
		test('Delete with where', done => {
			qb.where('id', 5)
				.delete('create_test', (err, rows) => {
					return callback(err, done);
				});
		});
		test('Delete multiple where values', done => {
			qb.delete('create_test', {
				id: 5,
				key: 'gogle'
			}, (err, rows) => {
				return callback(err, done);
			});
		});
	});
	suite('Grouping tests', () => {
		test('Using grouping method', done => {
			qb.select('id, key as k, val')
				.from('create_test')
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.limit(2, 1)
				.get((err, rows) => {
					return callback(err, done);
				});
		});
		test('Using where first grouping', done => {
			qb.select('id, key as k, val')
				.from('create_test')
				.where('id !=', 5)
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.limit(2, 1)
				.get((err, rows) => {
					return callback(err, done);
				});
		});
		test('Using or grouping method', done => {
			qb.select('id, key as k, val')
				.from('create_test')
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.orGroupStart()
				.where('id', 0)
				.groupEnd()
				.limit(2, 1)
				.get((err, rows) => {
					return callback(err, done);
				});
		});
		test('Using or not grouping method', done => {
			qb.select('id, key as k, val')
				.from('create_test')
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.orNotGroupStart()
				.where('id', 0)
				.groupEnd()
				.limit(2, 1)
				.get((err, rows) => {
					return callback(err, done);
				});
		});
	});
	suite('Get compiled tests', () => {
		test('select', () => {
			let sql = qb.select('id')
				.from('create_test')
				.getCompiledSelect(true);

			expect(helpers.isString(sql)).to.be.true;
		});
		test('select from', () => {
			let sql = qb.select('id')
				.getCompiledSelect('create_test', true);

			expect(helpers.isString(sql)).to.be.true;
		});
		test('insert', () => {
			let sql = qb.set('id', 3)
				.getCompiledInsert('create_test');

			expect(helpers.isString(sql)).to.be.true;
		});
		test('update', () => {
			let sql = qb.set('id', 3)
				.where('id', 5)
				.getCompiledUpdate('create_test');

			expect(helpers.isString(sql)).to.be.true;
		});
		test('delete', () => {
			let sql = qb.where('id', 5)
				.getCompiledDelete('create_test');

			expect(helpers.isString(sql)).to.be.true;
		});
	});
	suite('Misc tests', () => {
		test('Get State', () => {
			qb.select('foo')
				.from('bar')
				.where('baz', 'foobar');

			let state = new State();

			expect(JSON.stringify(state)).to.not.be.deep.equal(qb.getState());
		});
		test('Reset State', () => {
			qb.select('foo')
				.from('bar')
				.where('baz', 'foobar');

			qb.resetQuery();

			let state = new State();

			expect(qb.getState()).to.be.deep.equal(state);
		})
	});
};