"use strict";

let expect = require('chai').expect;

// Use the base driver as a mock for testing
let getArgs = require('getargs');
let helpers = require('../lib/helpers');
let driver = require('../lib/Driver');

let p = require('../lib/QueryParser');
let	parser = new p(driver);

let State = require('../lib/State');

// Simulate query builder state
let state = new State();

let mixedSet = function mixedSet(/* $letName, $valType, $key, [$val] */) {
	let args = getArgs('$letName:string, $valType:string, $key:object|string|number, [$val]', arguments);

	let obj = {};

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

	Object.keys(obj).forEach(k => {
		// If a single value for the return
		if (['key','value'].indexOf(args.$valType) !== -1)
		{
			let pushVal = (args.$valType === 'key') ? k : obj[k];
			state[args.$letName].push(pushVal);
		}
		else
		{
			state[args.$letName][k] = obj[k];
		}
	});


	return state[args.$letName];
}

let whereMock = function() {
	let args = getArgs('key:string|object, [val]', arguments);

	state.whereMap = [];
	state.whereValues = [];

	mixedSet('rawWhereValues', 'value', args.key, args.val);
	mixedSet('whereMap', 'both', args.key, args.val);
}

// -----------------------------------------------------------------------------
// ! Start Tests
// -----------------------------------------------------------------------------

suite('Query Parser Tests', () => {
	suite('Has operator tests', () => {
		test('Has operator', () => {
			let matches = parser.hasOperator('foo <> 2');
			expect(matches).to.be.deep.equal(['<>']);
		});
		test('Has no operator', () => {
			let matches = parser.hasOperator('foo');
			expect(matches).to.be.null;
		})
	});
	suite('Where parser tests', () => {
		setup(() => {
			state = new State();
		});
		test('Has function full string', () => {
			whereMock('time < SUM(FOO(BAR()))');
			parser.parseWhere(driver, state);
			expect(state.whereMap)
				.to.be.deep.equal(['"time" < SUM(FOO(BAR()))']);
		});
		test('Has function key/val', () => {
			whereMock('time <', 'SUM(FOO(BAR()))');
			parser.parseWhere(driver, state);
			expect(state.whereMap)
				.to.be.deep.equal(['"time" < SUM(FOO(BAR()))']);
		});
		test('Has function key/val object', () => {
			whereMock({
				'time <': "SUM(FOO(BAR('x')))"
			});
			parser.parseWhere(driver, state);
			expect(state.whereMap)
				.to.be.deep.equal(['"time" < SUM(FOO(BAR(\'x\')))']);
		});
		test('Has literal value', () => {
			whereMock({
				'foo': 3
			});
			parser.parseWhere(driver, state);
			expect(state.whereMap)
				.to.be.deep.equal(['"foo" = ?']);
			expect(state.whereValues)
				.to.be.deep.equal(['3']);
		});
		test('Has multiple literal values', () => {
			whereMock({
				foo: 3,
				bar: 5
			});
			parser.parseWhere(driver, state);
			expect(state.whereMap)
				.to.be.deep.equal(['"foo" = ?', '"bar" = ?']);
			expect(state.whereValues)
				.to.be.deep.equal(['3','5']);
		});
	});
	suite('Parse join tests', () => {
		let data = [{
			desc: 'Simple equals condition',
			join: 'table1.field1=table2.field2',
			expected: ['table1.field1','=','table2.field2']
		},{
			desc: 'Db.table.field condition',
			join: 'db1.table1.field1!=db2.table2.field2',
			expected: ['db1.table1.field1','!=', 'db2.table2.field2']
		},{
			desc: 'Underscore in identifier',
			join: 'table_1.field1 = tab_le2.field_2',
			expected: ['table_1.field1', '=', 'tab_le2.field_2']
		},{
			desc: 'Function in condition',
			join: 'table1.field1 > SUM(3+6)',
			expected: ['table1.field1', '>', 'SUM(3+6)']
		}];

		data.forEach(datum => {
			test(datum.desc, () => {
				let matches = parser.parseJoin(datum.join);
				expect(matches.combined).to.be.deep.equal(datum.expected);
			})
		});
	});
	suite('Compile join tests', () => {
		let data = [{
			desc: 'Simple equals condition',
			clause: 'table1.field1=table2.field2',
			expected: '"table1"."field1" = "table2"."field2"'
		},{
			desc: 'Db.table.field condition',
			clause: 'db1.table1.field1!=db2.table2.field2',
			expected: '"db1"."table1"."field1" != "db2"."table2"."field2"'
		},{
			desc: 'Underscore in identifier',
			clause: 'table_1.field1 = tab_le2.field_2',
			expected: '"table_1"."field1" = "tab_le2"."field_2"'
		},{
			desc: 'Function in condition',
			clause: 'table1.field1 > SUM(3+6)',
			expected: '"table1"."field1" > SUM(3+6)'
		}];

		data.forEach(datum => {
			test(datum.desc, () => {
				let join = parser.compileJoin(datum.clause);
				expect(join).to.be.deep.equal(datum.expected);
			});
		});
	});
});