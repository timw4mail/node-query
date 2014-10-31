'use strict';

// Load the test base
delete require.cache[require.resolve('../query-builder-base')];
var testBase = require('../query-builder-base');
var tests = testBase.tests;

// Load the test config file
var adapterName = 'dblite';

// Set up the connection
var sqlite = require(adapterName).withSQLite('3.8.6+');
var connection = sqlite(':memory:');

// Set up the query builder object
var nodeQuery = require('../../lib/node-query');
var qb = nodeQuery('sqlite', connection, adapterName);

// Set up the sqlite database
var sql = 'CREATE TABLE IF NOT EXISTS "create_test" ("id" INTEGER PRIMARY KEY, "key" TEXT, "val" TEXT);' +
'CREATE TABLE IF NOT EXISTS "create_join" ("id" INTEGER PRIMARY KEY, "key" TEXT, "val" TEXT);';
connection.query(sql);

// Set up the test base
testBase._setUp(qb, function(test, err, rows) {
	if (err != null) {
		test.done();
		throw new Error(err);
	}

	// Insert/Update/Delete queries return undefined
	if (rows === undefined) {
		rows = {};
	}

	test.ok(rows, 'dblite: Valid result for generated query');
	test.done();
});

tests["dblite adapter with query builder"] = function(test) {
	test.expect(1);
	test.ok(testBase.qb);

	// Close the db connection
	connection.close();
	test.done();
};

// Export the final test object
module.exports = tests;