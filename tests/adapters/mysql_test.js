'use strict';

var configFile = (process.env.CI) ? '../config-travis.json' : '../config.json';

// Load the test base
delete require.cache[require.resolve('../query-builder-base')];
var testBase = require('../query-builder-base');
var tests = testBase.tests;

// Load the test config file
var adapterName = 'mysql';
var config = require(configFile)[adapterName];

// Set up the connection
var mysql = require(adapterName);
var connection = mysql.createConnection(config.conn);

// Set up the query builder object
var nodeQuery = require('../../lib/node-query');
var qb = nodeQuery.init('mysql', connection);

// Set up the test base
testBase._setUp(qb, function(test, err, rows) {
	if (err != null) {
		test.done();
		throw new Error(err);
	}

	test.ok(rows, 'mysql: Valid result for generated query');
	test.done();
});

tests['nodeQuery.getQuery = nodeQuery.init'] = function(test) {
	test.expect(1);
	test.deepEqual(qb, nodeQuery.getQuery(), "getQuery returns same object");
	test.done();
};

tests["mysql adapter with query builder"] = function(test) {
	test.expect(1);
	test.ok(testBase.qb);

	// Close the db connection
	qb = null;
	connection.destroy();

	test.done();
};

// Export the final test object
module.exports = tests;
