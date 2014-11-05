'use strict';

// Load the test base
delete require.cache[require.resolve('../query-builder-base')];
var testBase = require('../query-builder-base');
var tests = testBase.tests;

// Load the test config file
var adapterName = 'sqlite3';
var sqlite = null;
var connection = null;

// Set up the connection
try {
	sqlite = require(adapterName).verbose();
	connection = new sqlite.Database(':memory:');
} catch (e) {
	// Export an empty testsuite if module not loaded
	console.log(e);
	console.log("Database adapter sqlite3 not found");
	return {};
}

if (connection)
{
	// Set up the query builder object
	var nodeQuery = require('../../lib/node-query');
	var qb = nodeQuery.init('sqlite', connection, adapterName);

	// Set up the sqlite database
	var sql = 'CREATE TABLE IF NOT EXISTS "create_test" ("id" INTEGER PRIMARY KEY, "key" TEXT, "val" TEXT);';
	var sql2 = 'CREATE TABLE IF NOT EXISTS "create_join" ("id" INTEGER PRIMARY KEY, "key" TEXT, "val" TEXT);';
	connection.serialize(function() {
		connection.run(sql);
		connection.run(sql2);
	});

	// Set up the test base
	testBase._setUp(qb, function(test, err, result) {
		if (err != null) {
			test.done();
			throw new Error(err);
		}

		// Insert/Update/Delete queries return undefined
		if (result === undefined) {
			result = {};
		}

		test.ok(result, 'sqlite3: Valid result for generated query');
		test.done();
	});

	tests['nodeQuery.getQuery = nodeQuery.init'] = function(test) {
		test.expect(1);
		test.deepEqual(qb, nodeQuery.getQuery(), "getQuery returns same object");
		test.done();
	};

	tests["sqlite3 adapter with query builder"] = function(test) {
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



