"use strict";

var modules = {
	helpers: require('../lib/helpers'),
	driver: require('../lib/DriverBase'),
	qb: require('../lib/QueryBuilder'),
	'node-query': require('../lib/NodeQuery'),
	'state': require('../lib/State'),
	'drivers/pg': require('../lib/drivers/Pg'),
	'drivers/mysql': require('../lib/drivers/Mysql'),
	'drivers/sqlite': require('../lib/drivers/Sqlite'),
	'adapters/mysql': require('../lib/adapters/mysql'),
	'adapters/mysql2': require('../lib/adapters/mysql2'),
	'adapters/pg': require('../lib/adapters/pg'),
	'adapters/dblite': require('../lib/adapters/dblite')
};

module.exports = {
	'Sanity check': function (test) {
		test.expect(modules.length);

		Object.keys(modules).forEach(function(mod) {
			test.ok(modules[mod], mod + " module is sane");
		});

		test.done();
	},
	'NodeQuery.getQuery with no instance': function(test) {
		test.expect(1);
		test.throws(function() {
			nodeQuery.getQuery();
		}, Error, "No query builder instance if none created");
		test.done();
	},
	'Invalid driver type': function(test) {
		test.expect(1);
		test.throws(function() {
			nodeQuery.init('foo', {}, 'bar');
		}, Error, "Bad driver throws exception");
		test.done();
	}
};