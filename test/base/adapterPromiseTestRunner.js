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

module.exports = function promiseTestRunner(qb) {
	Object.keys(tests).forEach(suiteName => {
		suite(suiteName, () => {
			let currentSuite = tests[suiteName];
			Object.keys(currentSuite).forEach(testDesc => {
				test(`Promise - ${testDesc}`, () => {
					let methodObj = currentSuite[testDesc];
					let methodNames = Object.keys(methodObj);
					let lastMethodIndex = methodNames[methodNames.length - 1];
					let results = [];

					methodNames.forEach(name => {
						let args = methodObj[name],
							method = qb[name];

						if (args[0] === 'multiple') {
							args.shift();
							args.forEach(argSet => {
								results.push(method.apply(qb, argSet));
							});

						} else {
							results.push(method.apply(qb, args));
						}
					});

					let promise = results.pop();
					return expect(promise).to.be.fulfilled;
				});
			});
		});
	});
	suite('DB update tests -', () => {
		suiteSetup(done => {
			let sql = qb.driver.truncate('create_test');
			qb.query(sql).then(res => {
				return done();
			}).catch(err => {
				return done(err);
			});
		});
		test('Promise - Test Insert', () => {
			let promise = qb.set('id', 98)
				.set('key', '84')
				.set('val', new Buffer('120'))
				.insert('create_test');

			return expect(promise).to.be.fulfilled;
		});
		test('Promise - Test Insert Object', () => {
			let promise = qb.insert('create_test', {
				id: 587,
				key: 1,
				val: new Buffer('2'),
			});

			return expect(promise).to.be.fulfilled;
		});
		test('Promise - Test Update', () => {
			let promise = qb.where('id', 7)
				.update('create_test', {
					id: 7,
					key: 'gogle',
					val: new Buffer('non-word'),
				});

			return expect(promise).to.be.fulfilled;
		});
		test('Promise - Test set Array Update', () => {
			let object = {
				id: 22,
				key: 'gogle',
				val: new Buffer('non-word'),
			};

			let promise = qb.set(object)
				.where('id', 22)
				.update('create_test');

			return expect(promise).to.be.fulfilled;
		});
		test('Promise - Test where set update', () => {
			let promise = qb.where('id', 36)
				.set('id', 36)
				.set('key', 'gogle')
				.set('val', new Buffer('non-word'))
				.update('create_test');

			return expect(promise).to.be.fulfilled;
		});
		test('Promise - Test delete', () => {
			let promise = qb.delete('create_test', {id: 5});
			return expect(promise).to.be.fulfilled;
		});
		test('Promise - Delete with where', () => {
			let promise = qb.where('id', 5)
				.delete('create_test');

			return expect(promise).to.be.fulfilled;
		});
		test('Promise - Delete multiple where values', () => {
			let promise = qb.delete('create_test', {
				id: 5,
				key: 'gogle',
			});

			return expect(promise).to.be.fulfilled;
		});
	});
	suite('Grouping tests -', () => {
		test('Promise - Using grouping method', () => {
			let promise = qb.select('id, key as k, val')
				.from('create_test')
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.limit(2, 1)
				.get();

			return expect(promise).to.be.fulfilled;
		});
		test('Promise - Using where first grouping', () => {
			let promise = qb.select('id, key as k, val')
				.from('create_test')
				.where('id !=', 5)
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.limit(2, 1)
				.get();

			return expect(promise).to.be.fulfilled;
		});
		test('Promise - Using or grouping method', () => {
			let promise = qb.select('id, key as k, val')
				.from('create_test')
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.orGroupStart()
				.where('id', 0)
				.groupEnd()
				.limit(2, 1)
				.get();

			return expect(promise).to.be.fulfilled;
		});
		test('Promise - Using or not grouping method', () => {
			let promise = qb.select('id, key as k, val')
				.from('create_test')
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.orNotGroupStart()
				.where('id', 0)
				.groupEnd()
				.limit(2, 1)
				.get();

			return expect(promise).to.be.fulfilled;
		});
	});
};