// Use the base driver as a mock for testing
const Helpers = require('../lib/Helpers');
const driver = require('../lib/Driver');

const P = require('../lib/QueryParser');
let	parser = new P(driver);

const State = require('../lib/State');

// Simulate query builder state
let state = new State();

let mixedSet = function mixedSet (letName, valType, key, val) {
	let obj = {};

	if (Helpers.isScalar(key) && !Helpers.isUndefined(val)) {
		// Convert key/val pair to a simple object
		obj[key] = val;
	} else if (Helpers.isScalar(key) && Helpers.isUndefined(val)) {
		// If just a string for the key, and no value, create a simple object with duplicate key/val
		obj[key] = key;
	} else {
		obj = key;
	}

	Object.keys(obj).forEach(k => {
		// If a single value for the return
		if (['key', 'value'].indexOf(valType) !== -1) {
			let pushVal = (valType === 'key') ? k : obj[k];
			state[letName].push(pushVal);
		} else {
			state[letName][k] = obj[k];
		}
	});

	return state[letName];
};

let whereMock = function (key, val) {
	state.whereMap = [];
	state.whereValues = [];

	mixedSet('rawWhereValues', 'value', key, val);
	mixedSet('whereMap', 'both', key, val);
};

// -----------------------------------------------------------------------------
// ! Start Tests
// -----------------------------------------------------------------------------

describe('Query Parser Tests', () => {
	describe('Has operator tests', () => {
		it('Has operator', () => {
			let matches = parser.hasOperator('foo <> 2');
			expect(matches).toEqual(['<>']);
		});
		it('Has no operator', () => {
			let matches = parser.hasOperator('foo');
			expect(matches).toBe(null);
		});
	});
	describe('Where parser tests', () => {
		beforeAll(() => {
			state = new State();
		});
		it('Has function full string', () => {
			whereMock('time < SUM(FOO(BAR()))');
			parser.parseWhere(driver, state);
			expect(state.whereMap)
				.toEqual(['"time" < SUM(FOO(BAR()))']);
		});
		it('Has function key/val', () => {
			whereMock('time <', 'SUM(FOO(BAR()))');
			parser.parseWhere(driver, state);
			expect(state.whereMap)
				.toEqual(['"time" < SUM(FOO(BAR()))']);
		});
		it('Has function key/val object', () => {
			whereMock({
				'time <': 'SUM(FOO(BAR(\'x\')))'
			});
			parser.parseWhere(driver, state);
			expect(state.whereMap)
				.toEqual(['"time" < SUM(FOO(BAR(\'x\')))']);
		});
		it('Has literal value', () => {
			whereMock({
				foo: 3
			});
			parser.parseWhere(driver, state);
			expect(state.whereMap)
				.toEqual(['"foo" = ?']);
			expect(state.whereValues)
				.toEqual(['3']);
		});
		it('Has multiple literal values', () => {
			whereMock({
				foo: 3,
				bar: 5
			});
			parser.parseWhere(driver, state);
			expect(state.whereMap)
				.toEqual(['"foo" = ?', '"bar" = ?']);
			expect(state.whereValues)
				.toEqual(['3', '5']);
		});
	});
	describe('Parse join tests', () => {
		let data = [
			{
				desc: 'Simple equals condition',
				join: 'table1.field1=table2.field2',
				expected: ['table1.field1', '=', 'table2.field2']
			}, {
				desc: 'Db.table.field condition',
				join: 'db1.table1.field1!=db2.table2.field2',
				expected: ['db1.table1.field1', '!=', 'db2.table2.field2']
			}, {
				desc: 'Underscore in identifier',
				join: 'table_1.field1 = tab_le2.field_2',
				expected: ['table_1.field1', '=', 'tab_le2.field_2']
			}, {
				desc: 'Function in condition',
				join: 'table1.field1 > SUM(3+6)',
				expected: ['table1.field1', '>', 'SUM(3+6)']
			}
		];

		data.forEach(datum => {
			it(datum.desc, () => {
				let matches = parser.parseJoin(datum.join);
				expect(matches.combined).toEqual(datum.expected);
			});
		});
	});
	describe('Compile join tests', () => {
		let data = [
			{
				desc: 'Simple equals condition',
				clause: 'table1.field1=table2.field2',
				expected: '"table1"."field1" = "table2"."field2"'
			}, {
				desc: 'Db.table.field condition',
				clause: 'db1.table1.field1!=db2.table2.field2',
				expected: '"db1"."table1"."field1" != "db2"."table2"."field2"'
			}, {
				desc: 'Underscore in identifier',
				clause: 'table_1.field1 = tab_le2.field_2',
				expected: '"table_1"."field1" = "tab_le2"."field_2"'
			}, {
				desc: 'Function in condition',
				clause: 'table1.field1 > SUM(3+6)',
				expected: '"table1"."field1" > SUM(3+6)'
			}
		];

		data.forEach(datum => {
			it(datum.desc, () => {
				let join = parser.compileJoin(datum.clause);
				expect(join).toEqual(datum.expected);
			});
		});
	});
});
