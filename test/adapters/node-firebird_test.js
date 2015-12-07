'use strict';

// Load the test base
let reload = require('require-reload')(require);
let expect = reload('chai').expect;
let tests = reload('./adapterTestBase').tests;
let testRunner = reload('./adapterTestBase').runner;

// Load the test config file
let adapterName = 'node-firebird';
let Firebird = reload(adapterName);
let config = reload('../config.json')[adapterName];
config.conn.database = __dirname + config.conn.database;
let nodeQuery = reload('../../lib/NodeQuery');

// Skip on TravisCi
if (process.env.CI || process.env.JENKINS_HOME)
{
	return;
}

suite('Firebird adapter tests', () => {
	Firebird.attach(config.conn, (err, db) => {
		// Set up the query builder object
		let qb = nodeQuery.init('firebird', db, adapterName);

		testRunner(tests, qb, (err, done) => {
			expect(err).is.not.ok;
			done();
		});
		suite('Adapter-specific tests', () => {
			test('nodeQuery.getQuery = nodeQuery.init', () => {
				expect(nodeQuery.getQuery())
					.to.be.deep.equal(qb);
			});
			test('insertBatch throws error', () => {
				expect(() => {
					qb.driver.insertBatch('create_test', []);
				}).to.throw(Error, "Not Implemented");
			});
		});
		suiteTeardown(() => {
			db.detach();
		});
	});
});