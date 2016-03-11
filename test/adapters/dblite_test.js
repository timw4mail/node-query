'use strict';

// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
const expect =  testBase.expect;
const promiseTestRunner = testBase.promiseTestRunner;
const testRunner = testBase.testRunner;
let tests = reload('../base/tests');

// Load the test config file
const configFile = (process.env.TRAVIS) ? '../config-travis.json' : '../config.json';
const config = reload(configFile);

// Set up the query builder object
let nodeQuery = require('../../lib/NodeQuery')(config.dblite);
let qb = nodeQuery.getQuery();

suite('Dblite adapter tests -', () => {
	suiteSetup(done => {
		// Set up the sqlite database
		let sql = `CREATE TABLE IF NOT EXISTS "create_test" ("id" INTEGER PRIMARY KEY, "key" TEXT, "val" TEXT);
CREATE TABLE IF NOT EXISTS "create_join" ("id" INTEGER PRIMARY KEY, "key" TEXT, "val" TEXT);`;

		qb.query(sql, () => {
			return done();
		});
	});

	/*---------------------------------------------------------------------------
	Callback Tests
	---------------------------------------------------------------------------*/

	testRunner(qb, (err, done) => {
		expect(err).is.not.ok;
		done();
	});
	test('Callback - Select with function and argument in WHERE clause', done => {
		qb.select('id')
			.from('create_test')
			.where('id', 'ABS(-88)')
			.get((err, rows) => {
				expect(err).is.not.ok;
				return done();
			});
	});
	test('Callback - Test Insert Batch', done => {
		let data = [
			{
				id: 544,
				key: 3,
				val: new Buffer('7'),
			}, {
				id: 89,
				key: 34,
				val: new Buffer('10 o\'clock'),
			}, {
				id: 48,
				key: 403,
				val: new Buffer('97'),
			},
		];

		qb.insertBatch('create_test', data, (err, rows) => {
			expect(err).is.not.ok;
			return done();
		});
	});

	/*---------------------------------------------------------------------------
	Promise Tests
	---------------------------------------------------------------------------*/
	promiseTestRunner(qb);
	test('Promise - Select with function and argument in WHERE clause', () => {
		let promise = qb.select('id')
			.from('create_test')
			.where('id', 'ABS(-88)')
			.get();

		expect(promise).to.be.fulfilled;
	});
});
