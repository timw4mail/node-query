'use strict';

// Load the test base
const path = require('path');
const reload = require('require-reload')(require);
const testBase = reload('../base');
const expect = testBase.expect;
const testRunner = testBase.promiseTestRunner;

// Skip on CI
if (process.env.CI || process.env.TRAVIS) {
	return;
}

// Load the test config file
let adapterName = 'node-firebird';
let Firebird = reload(adapterName);
const config = reload('../config.json')[adapterName];
config.connection.database = path.join(__dirname, config.connection.database);
let nodeQuery = reload('../../lib/NodeQuery')(config);

let qb = nodeQuery.getQuery();

suite('Firebird adapter tests -', () => {
	test('nodeQuery.getQuery = nodeQuery.init', () => {
		expect(nodeQuery.getQuery())
			.to.be.deep.equal(qb);
	});
	test('insertBatch throws error', () => {
		expect(() => {
			qb.driver.insertBatch('create_test', []);
		}).to.throw(Error, 'Not Implemented');
	});

	testRunner(qb);

	suiteTeardown(() => {
		qb.end();
	});
});
