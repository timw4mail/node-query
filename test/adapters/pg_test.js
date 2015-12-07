'use strict';

let configFile = (process.env.CI) ? '../config-travis.json' : '../config.json';

// Load the test base
let reload = require('require-reload')(require);
let expect = reload('chai').expect;
let tests = reload('./adapterTestBase').tests;
let testRunner = reload('./adapterTestBase').runner;

// Load the test config file
let adapterName = 'pg';
let config = reload(configFile)[adapterName];

// Set up the connection
let pg = reload(adapterName);
let connection = new pg.Client(config.conn);
connection.connect(function(err) {
	if (err) {
		throw new Error(err);
	}
});

// Set up the query builder object
let nodeQuery = reload('../../lib/NodeQuery');
let qb = nodeQuery.init('pg', connection);

suite('Pg adapter tests', () => {
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
		connection.end();
	});
});