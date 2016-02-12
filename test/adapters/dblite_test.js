'use strict';

// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
const expect =  testBase.expect,
	promiseTestRunner = testBase.promiseTestRunner,
	testRunner = testBase.testRunner;

let tests = reload('../base/tests');

// Load the test config file
let adapterName = 'dblite';
let sqlite = null;
let connection = null;

// Set up the connection
try {
	sqlite = require(adapterName).withSQLite('3.7.11');
	connection = sqlite(':memory:');
} catch (e) {
	// Export an empty testsuite if module not loaded
}

if (connection) {
	// Set up the query builder object
	let nodeQuery = require('../../lib/NodeQuery');
	let qb = nodeQuery.init('sqlite', connection, adapterName);

	suite('Dblite adapter tests -', () => {
		suiteSetup(done => {
			// Set up the sqlite database
			let sql = 'CREATE TABLE IF NOT EXISTS "create_test" ("id" INTEGER PRIMARY KEY, "key" TEXT, "val" TEXT);' +
			'CREATE TABLE IF NOT EXISTS "create_join" ("id" INTEGER PRIMARY KEY, "key" TEXT, "val" TEXT);';
			connection.query(sql, () => {
				return done();
			});
		});
		test('nodeQuery.getQuery = nodeQuery.init', () => {
			expect(nodeQuery.getQuery())
				.to.be.deep.equal(qb);
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
}