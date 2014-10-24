'use strict';

// Load a fresh version of the test base
delete require.cache[require.resolve('../query-builder-base')];
var testBase = require('../query-builder-base');
var tests = testBase.tests;

// Load the test config file
var adapterName = 'mysql2';
var config = require('../config.json')[adapterName];

// Set up the connection
var mysql2 = require(adapterName);
var connection = mysql2.createConnection(config.conn);

// Set up the query builder object
var nodeQuery = require('../../lib/node-query');
var qb = nodeQuery('mysql', connection, adapterName);

// Set up the test base
testBase._setUp(qb, function(test, err, rows) {
	if (err) {
		throw new Error(err);
	}

	test.ok(rows, 'Valid result for generated query');
	test.done();
});

// Export the final test object
tests["mysql2 adapter with query builder"] = function(test) {
	test.ok(testBase.qb);
	test.done();
};


module.exports = tests;