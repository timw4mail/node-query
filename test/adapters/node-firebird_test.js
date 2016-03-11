'use strict';

(() => {
	// Load the test base
	const path = require('path');
	const reload = require('require-reload')(require);
	const testBase = reload('../base');
	const promisify = require('../../lib/promisify');
	const expect = reload('chai').expect;
	const testRunner = testBase.testRunner;
	const promiseTestRunner = testBase.promiseTestRunner;

	// Load the test config file
	let adapterName = 'node-firebird';
	let Firebird = reload(adapterName);
	const config = reload('../config.json')[adapterName];
	config.connection.database = path.join(__dirname, config.connection.database);
	let nodeQuery = reload('../../lib/NodeQuery')(config);

	let qb = nodeQuery.getQuery();

	// Skip on TravisCi
	if (process.env.CI) {
		return;
	}

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

		//---------------------------------------------------------------------------
		// Callback Tests
		//---------------------------------------------------------------------------
		testRunner(qb, (err, done) => {
			expect(err).is.not.ok;
			done();
		});

		//---------------------------------------------------------------------------
		// Promise Tests
		//---------------------------------------------------------------------------
		qb.adapter.execute(qb.driver.truncate('create_test')).then(() => {
			promiseTestRunner(qb);
		});
		suiteTeardown(() => {
			qb.end();
		});
	});
})();
