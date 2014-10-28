'use strict';

var configFile = (process.env.CI) ? '../config-travis.json' : '../config.json';

// Load the test base
delete require.cache[require.resolve('../query-builder-base')];
var testBase = require('../query-builder-base');
var tests = testBase.tests;

// Load the test config file
var adapterName = 'pg';
var config = require(configFile)[adapterName];

// Set up the connection
var pg = require(adapterName);
var connection = new pg.Client(config.conn);
connection.connect(function(err) {
	if (err) {
		throw new Error(err);
	}
});

// Set up the query builder object
var nodeQuery = require('../../lib/node-query');
var qb = nodeQuery('pg', connection, adapterName);


// Set up the test base
testBase._setUp(qb, function(test, err, result) {
	if (err != null) {
		console.error('SQL syntax error', err);
	}

	test.ok(result, 'pg: Valid result for generated query');
	test.done();
});


tests["pg adapter with query builder"] = function(test) {
	test.expect(1);
	test.ok(testBase.qb);

	// Close the db connection
	connection.end();
	test.done();
};


module.exports = tests;