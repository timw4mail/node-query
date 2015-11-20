'use strict';

var configFile = (process.env.CI) ? '../config-travis.json' : '../config.json';

// Load a fresh version of the test base
delete require.cache[require.resolve('../query-builder-base')];
var testBase = require('../query-builder-base');
var tests = testBase.tests;

// Load the test config file
var adapterName = 'mysql2';
var config = require(configFile)[adapterName];

// Set up the connection
var mysql2 = require(adapterName);
var connection = mysql2.createConnection(config.conn);

// Set up the query builder object
var nodeQuery = require('../../lib/node-query');
var qb = nodeQuery.init('mysql', connection, adapterName);



tests['nodeQuery.getQuery = nodeQuery.init'] = function(test) {
	test.expect(1);
	test.deepEqual(qb, nodeQuery.getQuery(), "getQuery returns same object");
	test.done();
};

// Export the final test object
tests["mysql2 adapter with query builder"] = function(test) {
	test.expect(1);
	test.ok(testBase.qb);

	// Close the db connection
	connection.end();
	test.done();
};

// Set up the test base
testBase._setUp(qb, function(test, err, rows) {
	if (err != null) {
		test.done();
		throw new Error(err);
	}

	test.ok(rows, 'mysql2: Invalid result for generated query');
	test.done();
});

module.exports = tests;