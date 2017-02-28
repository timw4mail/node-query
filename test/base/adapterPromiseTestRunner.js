/* eslint-env node, mocha */
'use strict';

// Load the test base
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const reload = require('require-reload')(require);
const tests = reload('../base/tests');

module.exports = function promiseTestRunner (qb) {
	Object.keys(tests).forEach(describeName => {
		describe(describeName, () => {
			let currentSuite = tests[describeName];
			Object.keys(currentSuite).forEach(testDesc => {
				it(testDesc, done => {
					const methodObj = currentSuite[testDesc];
					const methodNames = Object.keys(methodObj);
					let results = [];

					methodNames.forEach(name => {
						const args = methodObj[name];
						const method = qb[name];

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
					promise.then(result => {
						expect(result.rows).is.an('array');
						expect(result.rowCount()).to.not.be.undefined;
						expect(result.columnCount()).to.not.be.undefined;
						return done();
					}).catch(e => done(e));
				});
			});
		});
	});
	describe('DB update tests -', () => {
		beforeAll(done => {
			let sql = qb.driver.truncate('create_test');
			qb.query(sql).then(res => done())
				.catch(err => done(err));
		});
		it('Promise - Test Insert', () => {
			let promise = qb.set('id', 98)
				.set('key', '84')
				.set('val', Buffer.from('120'))
				.insert('create_test');

			return expect(promise).to.be.fulfilled;
		});
		it('Promise - Test Insert Object', () => {
			let promise = qb.insert('create_test', {
				id: 587,
				key: 1,
				val: Buffer.from('2')
			});

			return expect(promise).to.be.fulfilled;
		});
		it('Promise - Test Update', () => {
			let promise = qb.where('id', 7)
				.update('create_test', {
					id: 7,
					key: 'gogle',
					val: Buffer.from('non-word')
				});

			return expect(promise).to.be.fulfilled;
		});
		it('Promise - Test set Array Update', () => {
			let object = {
				id: 22,
				key: 'gogle',
				val: Buffer.from('non-word')
			};

			let promise = qb.set(object)
				.where('id', 22)
				.update('create_test');

			return expect(promise).to.be.fulfilled;
		});
		it('Promise - Test where set update', () => {
			let promise = qb.where('id', 36)
				.set('id', 36)
				.set('key', 'gogle')
				.set('val', Buffer.from('non-word'))
				.update('create_test');

			return expect(promise).to.be.fulfilled;
		});
		it('Promise - Test delete', () => {
			let promise = qb.delete('create_test', {id: 5});
			return expect(promise).to.be.fulfilled;
		});
		it('Promise - Delete with where', () => {
			let promise = qb.where('id', 5)
				.delete('create_test');

			return expect(promise).to.be.fulfilled;
		});
		it('Promise - Delete multiple where values', () => {
			let promise = qb.delete('create_test', {
				id: 5,
				key: 'gogle'
			});

			return expect(promise).to.be.fulfilled;
		});
	});
	describe('Grouping tests -', () => {
		it('Promise - Using grouping method', () => {
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
		it('Promise - Using where first grouping', () => {
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
		it('Promise - Using or grouping method', () => {
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
		it('Promise - Using or not grouping method', () => {
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
