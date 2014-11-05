'use strict';

// Load the test base
delete require.cache[require.resolve('../query-builder-base')];
var testBase = require('../query-builder-base');
var tests = testBase.tests;

// Load the test config file
var adapterName = 'dblite';
var sqlite = null;
var connection = null;

// Set up the connection
try {
	sqlite = require(adapterName).withSQLite('3.8.6+');
	connection = sqlite(':memory:');
} catch (e) {
	// Export an empty testsuite if module not loaded
	console.log(e);
	console.log("Database adapter dblite not found");
	return {};
}

if (connection)
{
	// Set up the query builder object
	var nodeQuery = require('../../lib/node-query');
	var qb = nodeQuery.init('sqlite', connection, adapterName);

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

	tests['nodeQuery.getQuery = nodeQuery.init'] = function(test) {
		test.expect(1);
		test.deepEqual(qb, nodeQuery.getQuery(), "getQuery returns same object");
		test.done();
	};

	tests["dblite adapter with query builder"] = function(test) {
		test.expect(1);
		test.ok(testBase.qb);

		// Close the db connection
		connection.close();
		test.done();
	};

	// Export the final test object
	module.exports = tests;
}
else
{
	module.exports = {};
}



