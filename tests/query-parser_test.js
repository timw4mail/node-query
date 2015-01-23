'use strict';

// Use the base driver as a mock for testing
delete require.cache[require.resolve('../lib/driver')];
var getArgs = require('getargs');
var helpers = require('../lib/helpers');
var driver = require('../lib/driver');
var	parser = require('../lib/query-parser')(driver);
var State = require('../lib/state');

// Simulate query builder state
var state = new State();

var mixedSet = function(/* $varName, $valType, $key, [$val] */) {
	var args = getArgs('$varName:string, $valType:string, $key:object|string|number, [$val]', arguments);

	var obj = {};


	if (helpers.isScalar(args.$key) && !helpers.isUndefined(args.$val))
	{
		// Convert key/val pair to a simple object
		obj[args.$key] = args.$val;
	}
	else if (helpers.isScalar(args.$key) && helpers.isUndefined(args.$val))
	{
		// If just a string for the key, and no value, create a simple object with duplicate key/val
		obj[args.$key] = args.$key;
	}
	else
	{
		obj = args.$key;
	}

	Object.keys(obj).forEach(function(k) {
		// If a single value for the return
		if (['key','value'].indexOf(args.$valType) !== -1)
		{
			var pushVal = (args.$valType === 'key') ? k : obj[k];
			state[args.$varName].push(pushVal);
		}
		else
		{
			state[args.$varName][k] = obj[k];
		}
	});


	return state[args.$varName];
}

var whereMock = function() {
	var args = getArgs('key:string|object, [val]', arguments);

	state.whereMap = [];
	state.whereValues = [];

	mixedSet('rawWhereValues', 'value', args.key, args.val);
	mixedSet('whereMap', 'both', args.key, args.val);
}

// -----------------------------------------------------------------------------
// ! Start Tests
// -----------------------------------------------------------------------------

module.exports = {
	'Has operator tests': {
		'Has operator': function(test) {
			var matches = parser.hasOperator('foo <> 2');
			test.deepEqual(['<>'], matches);
			test.done();
		},
		'Has no operator': function(test) {
			var matches = parser.hasOperator('foo');
			test.equal(null, matches);
			test.done();
		}
	},
	'Where parser tests': {
		'Has function full string': function(test) {
			test.expect(1);
			whereMock('time < SUM(FOO(BAR()))');
			var result = parser.parseWhere(driver, state);
			test.deepEqual(['"time" < SUM(FOO(BAR()))'], state.whereMap);

			test.done();
		},
		'Has function key/val': function(test) {
			test.expect(1);
			var map = whereMock('time <', 'SUM(FOO(BAR()))');
			state = parser.parseWhere(driver, state);
			test.deepEqual(['"time" < SUM(FOO(BAR()))'], state.whereMap);

			test.done();
		},
		'Has function key/val object': function(test) {
			test.expect(1);
			var map = whereMock({
				'time <': "SUM(FOO(BAR('x')))"
			});
			state = parser.parseWhere(driver, state);
			test.deepEqual(['"time" < SUM(FOO(BAR(\'x\')))'], state.whereMap);

			test.done();
		},
		'Has literal value': function(test) {
			test.expect(2);
			var map = whereMock({
				'foo': 3
			});
			state = parser.parseWhere(driver, state);
			test.deepEqual(['"foo" = ?'], state.whereMap);
			test.deepEqual(['3'], state.whereValues);

			test.done();
		},
		'Has multiple literal values': function(test) {
			test.expect(2);
			var map = whereMock({
				foo: 3,
				bar: 5
			});
			state = parser.parseWhere(driver, state);
			test.deepEqual(['"foo" = ?', '"bar" = ?'], state.whereMap);
			test.deepEqual(['3','5'], state.whereValues);

			test.done();
		}
	},
	'Parse join tests' : {
		'Simple equals condition': function(test) {
			var matches = parser.parseJoin('table1.field1=table2.field2');
			test.deepEqual(['table1.field1','=','table2.field2'], matches.combined);
			test.done();
		},
		'Db.table.field condition': function(test) {
			var matches = parser.parseJoin('db1.table1.field1!=db2.table2.field2');
			test.deepEqual(['db1.table1.field1','!=', 'db2.table2.field2'], matches.combined);
			test.done();
		},
		'Underscore in identifier': function(test) {
			var matches = parser.parseJoin('table_1.field1 = tab_le2.field_2');
			test.deepEqual(['table_1.field1', '=', 'tab_le2.field_2'], matches.combined);
			test.done();
		},
		'Function in condition': function(test) {
			var matches = parser.parseJoin('table1.field1 > SUM(3+6)');
			test.deepEqual(['table1.field1', '>', 'SUM(3+6)'], matches.combined);
			test.done();
		}
	},
	'Compile join tests': {
		'Simple equals condition': function(test) {
			var join = parser.compileJoin('table1.field1=table2.field2');
			test.deepEqual('"table1"."field1" = "table2"."field2"', join);
			test.done();
		},
		'Db.table.field condition': function(test) {
			var join = parser.compileJoin('db1.table1.field1!=db2.table2.field2');
			test.deepEqual('"db1"."table1"."field1" != "db2"."table2"."field2"', join);
			test.done();
		},
		'Underscore in identifier': function(test) {
			var join = parser.compileJoin('table_1.field1 = tab_le2.field_2');
			test.deepEqual('"table_1"."field1" = "tab_le2"."field_2"', join);
			test.done();
		},
		'Function in condition': function(test) {
			var join = parser.compileJoin('table1.field1 > SUM(3+6)');
			test.deepEqual('"table1"."field1" > SUM(3+6)', join);
			test.done();
		}
	}
};