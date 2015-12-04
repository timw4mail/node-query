'use strict';

let assert = require('chai').assert;
let nodeQuery = require('../lib/NodeQuery');

suite('Base tests', () => {
	test('Sanity check', () => {
		let modules = {
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

		Object.keys(modules).forEach(mod => {
			assert.ok(modules[mod], mod + " module is sane");
		});
	});

	test('NodeQuery.getQuery with no instance', () => {
		assert.throws(() => {
			nodeQuery.getQuery();
		}, Error, "No Query Builder instance to return");
	});

	test('Invalid driver type', () => {
		assert.throws(() => {
			nodeQuery.init('foo', {}, 'bar');
		}, Error, "Selected driver (Foo) does not exist!");
	});
});