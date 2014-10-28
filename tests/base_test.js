"use strict";

var modules = {
	helpers: require('../lib/helpers'),
	driver: require('../lib/driver'),
	qb: require('../lib/query-builder'),
	'node-query': require('../lib/node-query'),
	'drivers/pg': require('../lib/drivers/pg'),
	'drivers/mysql': require('../lib/drivers/mysql'),
	adapter: require('../lib/adapter')
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
		}, function(err) {
			if (err instanceof Error) return true;
		});
		test.done();
	}
};