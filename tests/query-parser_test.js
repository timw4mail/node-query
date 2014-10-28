'use strict';

// Use the base driver as a mock for testing
delete require.cache[require.resolve('../lib/driver')];
var driver = require('../lib/driver');
var	parser = require('../lib/query-parser')(driver);

module.exports = {
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
			test.deepEqual('"table1"."field1"="table2"."field2"', join);
			test.done();
		},
		'Db.table.field condition': function(test) {
			var join = parser.compileJoin('db1.table1.field1!=db2.table2.field2');
			test.deepEqual('"db1"."table1"."field1"!="db2"."table2"."field2"', join);
			test.done();
		},
		'Underscore in identifier': function(test) {
			var join = parser.compileJoin('table_1.field1 = tab_le2.field_2');
			test.deepEqual('"table_1"."field1"="tab_le2"."field_2"', join);
			test.done();
		},
		'Function in condition': function(test) {
			var join = parser.compileJoin('table1.field1 > SUM(3+6)');
			test.deepEqual('"table1"."field1">SUM(3+6)', join);
			test.done();
		}
	}
};