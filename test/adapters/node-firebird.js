'use strict';

// Load the test base
const path = require('path');
const reload = require('require-reload')(require);
const testBase = reload('../base');
const expect = reload('chai').expect;
const testRunner = testBase.testRunner;
const promiseTestRunner = testBase.promiseTestRunner;

// Load the test config file
let adapterName = 'node-firebird';
let Firebird = reload(adapterName);
const config = reload('../config.json')[adapterName];
config.conn.database = path.join(__dirname, config.conn.database);
let nodeQuery = reload('../../lib/NodeQuery');

let qb = null;

// Skip on TravisCi
if (process.env.CI || process.env.JENKINS_HOME) {
	return;
}

suite('Firebird adapter tests -', () => {
	// Set up the query builder object
	suiteSetup('Database connection', connected => {
		Firebird.attach(config.conn, (err, db) => {
			qb = nodeQuery.init('firebird', db, adapterName);
			return connected(err);
		});
	});
	testRunner(qb, (err, done) => {
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
		qb.end();
	});
});