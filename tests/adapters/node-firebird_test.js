'use strict';

// Load the test base
var testBase = require('../query-builder-base');

// Load the test config file
var adapterName = 'node-firebird';
var config = require('../config.json')[adapterName];
config.conn.database = __dirname + config.conn.database;
var nodeQuery = require('../../lib/node-query');

// Set up the connection
try {
	var Firebird = require(adapterName);
	var conn = null;
	var qb = null;

	// Setup testbase from the inside out
	// Because the connection is async, utilize
	// the setUp function from nodeunit to get the connection
	testBase.tests.setUp = function(cb) {
		if ( ! conn)
		{
			// Connect to the database
			Firebird.attach(config.conn, function(err, db) {
				if (err) {
					throw new Error(err);
					console.error(err);
				}
				conn = db;

				// Set up the query builder object
				qb = nodeQuery.init('firebird', db, adapterName);

				testBase._setUp(qb, function(test, err, result) {
					if (err) {
						test.done();
						throw new Error(err);
					}

					result = result || [];

					test.ok(result, 'firebird: Valid result for generated query');
					test.done();
				});

				cb();
			});
		}
		else
		{
			cb();
		}
	};

	//delete testBase.tests['DB update tests'];
	testBase.tests['DB update tests']['Test Insert Batch'] = function(test) {
		test.expect(1);

		test.throws(function() {
			qb.insertBatch({}, (function() {}));
		}, Error, "Insert Batch not implemented for firebird");

		test.done();
	};

	testBase.tests["firebird adapter with query builder"] = function(test) {
		test.expect(1);
		test.ok(testBase.qb);

		// Disconnect from the db
		conn.detach();

		test.done();
	};

	module.exports = testBase.tests;

} catch (e) {
	// Export an empty testBase.testsuite if module not loaded
	console.log(e);
	console.log("Database adapter firebird not found");
	module.exports = {};
}