"use strict";

var modules = {
	helpers: require('../lib/helpers'),
	driver: require('../lib/driver'),
	qb: require('../lib/query-builder'),
	'node-query': require('../lib/node-query'),
	'drivers/pg': require('../lib/drivers/pg'),
	'drivers/mysql': require('../lib/drivers/mysql'),
	'drivers/sqlite': require('../lib/drivers/sqlite'),
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
	'Invalid driver type': function(test) {
		test.expect(1);
		test.throws(function() {
			modules['node-query']('foo', {}, 'bar');
		}, Error, "Bad driver throws exception");
		test.done();
	}
};