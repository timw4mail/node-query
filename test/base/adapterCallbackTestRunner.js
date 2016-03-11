'use strict';

// jscs:disable
// Load the test base
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const reload = require('require-reload')(require);
let tests = reload('../base/tests');

let helpers = reload('../../lib/helpers'),
	State = reload('../../lib/State');

module.exports = function testRunner(qb, callback) {
	Object.keys(tests).forEach(suiteName => {
		suite(suiteName, () => {
			let currentSuite = tests[suiteName];
			Object.keys(currentSuite).forEach(testDesc => {
				test(`Callback - ${testDesc}`, done => {
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
	suite('DB update tests -', () => {
		suiteSetup(() => qb.truncate('create_test'));
		test('Callback - Test Insert', done => {
			qb.set('id', 98)
				.set('key', '84')
				.set('val', new Buffer('120'))
				.insert('create_test', (err, rows) => {
					return callback(err, done);
				});
		});
		test('Callback - Test Insert Object', done => {
			qb.insert('create_test', {
				id: 587,
				key: 1,
				val: new Buffer('2'),
			}, (err, rows) => {
				return callback(err, done);
			});
		});
		test('Callback - Test Update', done => {
			qb.where('id', 7)
				.update('create_test', {
					id: 7,
					key: 'gogle',
					val: new Buffer('non-word'),
				}, (err, rows) => {
					return callback(err, done);
				});
		});
		test('Callback - Test set Array Update', done => {
			let object = {
				id: 22,
				key: 'gogle',
				val: new Buffer('non-word'),
			};

			qb.set(object)
				.where('id', 22)
				.update('create_test', (err, rows) => {
					return callback(err, done);
				});
		});
		test('Callback - Test where set update', done => {
			qb.where('id', 36)
				.set('id', 36)
				.set('key', 'gogle')
				.set('val', new Buffer('non-word'))
				.update('create_test', (err, rows) => {
					return callback(err, done);
				});
		});
		test('Callback - Test delete', done => {
			qb.delete('create_test', {id: 5}, (err, rows) => {
				return callback(err, done);
			});
		});
		test('Callback - Delete with where', done => {
			qb.where('id', 5)
				.delete('create_test', (err, rows) => {
					return callback(err, done);
				});
		});
		test('Callback - Delete multiple where values', done => {
			qb.delete('create_test', {
				id: 5,
				key: 'gogle',
			}, (err, rows) => {
				return callback(err, done);
			});
		});
	});
	suite('Grouping tests -', () => {
		test('Callback - Using grouping method', done => {
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
		test('Callback - Using where first grouping', done => {
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
		test('Callback - Using or grouping method', done => {
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
		test('Callback - Using or not grouping method', done => {
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
	suite('Get compiled tests -', () => {
		test('select', () => {
			let sql = qb.select('id')
				.from('create_test')
				.getCompiledSelect(true);

			return expect(helpers.isString(sql)).to.be.true;
		});
		test('select from', () => {
			let sql = qb.select('id')
				.getCompiledSelect('create_test', true);

			return expect(helpers.isString(sql)).to.be.true;
		});
		test('insert', () => {
			let sql = qb.set('id', 3)
				.getCompiledInsert('create_test');

			return expect(helpers.isString(sql)).to.be.true;
		});
		test('update', () => {
			let sql = qb.set('id', 3)
				.where('id', 5)
				.getCompiledUpdate('create_test');

			return expect(helpers.isString(sql)).to.be.true;
		});
		test('delete', () => {
			let sql = qb.where('id', 5)
				.getCompiledDelete('create_test');

			return expect(helpers.isString(sql)).to.be.true;
		});
	});
	suite('Misc tests -', () => {
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
		});
	});
};