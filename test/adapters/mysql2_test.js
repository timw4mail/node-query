'use strict';

let configFile = (process.env.CI) ? '../config-travis.json' : '../config.json';

// Load the test base
let reload = require('require-reload')(require);
reload.emptyCache();
let getArgs = reload('getargs');
let expect = reload('chai').expect;
let tests = reload('./adapterTestBase').tests;
let testRunner = reload('./adapterTestBase').runner;

// Load the test config file
let adapterName = 'mysql2';
let config = reload(configFile)[adapterName];

// Set up the connection
let mysql2 = reload(adapterName);
let connection = mysql2.createConnection(config.conn);

// Set up the query builder object
let nodeQuery = reload('../../lib/NodeQuery');
let qb = nodeQuery.init('mysql', connection, adapterName);

suite('Mysql2 adapter tests', () => {
	testRunner(tests, qb, (err, done) => {
		expect(err).is.not.ok;
		done();
	});
	suite('Adapter-specific tests', () => {
		test('nodeQuery.getQuery = nodeQuery.init', () => {
			expect(nodeQuery.getQuery())
				.to.be.deep.equal(qb);
		});
	});
	suiteTeardown(() => {
		connection.end();
	});
});