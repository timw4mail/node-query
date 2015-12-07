'use strict';

// Load the test base
let reload = require('require-reload')(require);
let getArgs = require('getargs');
let expect = require('chai').expect;
let tests = reload('./adapterTestBase').tests;
let testRunner = reload('./adapterTestBase').runner;

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

	// Add a test for this adapter
	tests['Select tests']['Select with function and argument in WHERE clause'] = {
		select: ['id'],
		from: ['create_test'],
		where: ['id', 'ABS(-88)'],
		get: [],
	};

	suite('Dblite adapter tests', () => {
		suiteSetup(() => {
			// Set up the sqlite database
			let sql = 'CREATE TABLE IF NOT EXISTS "create_test" ("id" INTEGER PRIMARY KEY, "key" TEXT, "val" TEXT);' +
			'CREATE TABLE IF NOT EXISTS "create_join" ("id" INTEGER PRIMARY KEY, "key" TEXT, "val" TEXT);';
			connection.query(sql);
		});
		testRunner(tests, qb, (err, done) => {
			expect(err).is.not.ok;
			done();
		});
		suite('Adapter-specific tests', () => {
			test('nodeQuery.getQuery = nodeQuery.init', () => {
				expect(nodeQuery.getQuery())
					.to.be.deep.equal(qb);
			});
			test('Test Insert Batch', done => {
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
		});
		suiteTeardown(() => {
			qb.end();
		});
	});
}