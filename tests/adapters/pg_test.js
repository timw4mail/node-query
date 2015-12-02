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
var nodeQuery = require('../../lib/NodeQuery');
var qb = nodeQuery.init('pg', connection);


// Set up the test base
testBase._setUp(qb, function(test, err, result) {
	if (err) {
		console.error('SQL syntax error', err);
	}

	test.ok(result, 'pg: Valid result for generated query');
	test.done();
});

tests['nodeQuery.getQuery = nodeQuery.init'] = function(test) {
	test.expect(1);
	test.deepEqual(qb, nodeQuery.getQuery(), "getQuery returns same object");
	test.done();
};

tests["pg adapter with query builder"] = function(test) {
	test.expect(1);
	test.ok(testBase.qb);

	// Close the db connection
	connection.end();
	test.done();
};


module.exports = tests;