'use strict';

// Load the test base
delete require.cache[require.resolve('../query-builder-base')];
var testBase = require('../query-builder-base');
var tests = testBase.tests;

// Load the test config file
var adapterName = 'mysql';
var config = require('../config.json')[adapterName];

// Set up the connection
var mysql = require(adapterName);
var connection = mysql.createConnection(config.conn);

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

tests["mysql adapter with query builder"] = function(test) {
	test.ok(testBase.qb);
	test.done();
};

// Export the final test object
module.exports = tests;
