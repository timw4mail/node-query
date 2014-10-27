'use strict';

// Load the test base
delete require.cache[require.resolve('../query-builder-base')];
var testBase = require('../query-builder-base');
var tests = testBase.tests;

// Load the test config file
var adapterName = 'pg';
var config = require('../config.json')[adapterName];

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
		//throw new Error(err);
		console.error('SQL syntax error', err);
	}

	test.ok(result, 'Valid result for generated query');
	test.done();
});


tests["pg adapter with query builder"] = function(test) {
	test.ok(testBase.qb);
	test.done();
};


module.exports = tests;