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
let adapterName = 'mysql';
let config = reload(configFile)[adapterName];

// Set up the connection
let mysql = reload(adapterName);
let connection = mysql.createConnection(config.conn);

// Set up the query builder object
let nodeQuery = reload('../../lib/NodeQuery');
let qb = nodeQuery.init('mysql', connection);

suite('Mysql adapter tests', () => {
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