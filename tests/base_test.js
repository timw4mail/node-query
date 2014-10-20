"use strict";

var modules = {
	helpers: require('../lib/helpers'),
	driver: require('../lib/driver'),
	qb: require('../lib/query-builder'),
	'node-query': require('../lib/node-query')
};

module.exports = {
	'Sanity check': function (test) {
		test.expect(modules.length);

		Object.keys(modules).forEach(function(mod) {
			test.ok(modules[mod], mod + " module is sane");
		});

		test.done();
	}
};