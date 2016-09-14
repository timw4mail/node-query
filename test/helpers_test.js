/* eslint-env node, mocha */
'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

let helpers = require('../lib/helpers');

suite('Helper Module Tests -', () => {
	suite('Type-checking methods -', () => {
		suite('Object wrappers are listed as their native type', () => {
			test('Boolean Wrapper returns \'boolean\' not \'object\'', () => {
				let item = Boolean(true);
				expect(helpers.type(item)).to.deep.equal('boolean');
			});
			test('Number Wrapper returns \'number\' not \'object\'', () => {
				let item = Number(4867);
				expect(helpers.type(item)).to.deep.equal('number');
			});
			test('String Wrapper returns \'string\' not \'object\'', () => {
				let item = String('Foo');
				expect(helpers.type(item)).to.deep.equal('string');
			});
		});
		suite('is..Method methods exist -', () => {
			let types = [
				'Null',
				'Undefined',
				'Object',
				'Array',
				'String',
				'Number',
				'Boolean',
				'Function',
				'RegExp',
				'NaN',
				'Infinite'
			];

			types.forEach(type => {
				test(`is${type} method exists`, () => {
					assert.ok(helpers[`is${type}`]);
				});
			});
		});
		suite('isScalar -', () => {
			let trueCases = {
				'Strings are scalar': 'foo',
				'Booleans are scalar': true,
				'Numbers are scalar': 545
			};
			Object.keys(trueCases).forEach(desc => {
				test(desc, () => {
					expect(helpers.isScalar(trueCases[desc])).to.be.true;
				});
			});

			let falseCases = {
				'Arrays are not scalar': [],
				'Objects are not scalar': []
			};
			Object.keys(falseCases).forEach(desc => {
				test(desc, () => {
					expect(helpers.isScalar(falseCases[desc])).to.be.false;
				});
			});
		});
		suite('isInfinity -', () => {
			test('The type of 1/0 is infinity', () => {
				expect(helpers.type(1 / 0)).to.equal('infinity');
			});
			test('isInfinity is the same as isInfinite', () => {
				expect(helpers.isInfinite(1 / 0)).to.be.true;
			});
		});
		suite('isNaN -', () => {
			test('The type of 0 / 0 is NaN', () => {
				expect(helpers.type(0 / 0)).to.equal('nan');
			});
			test('isNaN method agrees with type', () => {
				expect(helpers.isNaN(0 / 0)).to.be.true;
			});
		});
	});
	suite('Other helper methods -', () => {
		suite('stringTrim -', () => {
			test('stringTrim method works as expected', () => {
				let orig = ['  x y ', 'z   ', ' q'];
				let ret = ['x y', 'z', 'q'];

				expect(orig.map(helpers.stringTrim)).to.be.deep.equal(ret);
			});
		});
		suite('arrayPluck -', () => {
			let orig = [
				{
					foo: 1
				}, {
					foo: 2,
					bar: 10
				}, {
					foo: 3,
					bar: 15
				}
			];

			test('Finding members in all objects', () => {
				expect(helpers.arrayPluck(orig, 'foo')).to.be.deep.equal([1, 2, 3]);
			});
			test('Some members are missing in some objects', () => {
				expect(helpers.arrayPluck(orig, 'bar')).to.be.deep.equal([10, 15]);
			});
			test('Empty case', () => {
				expect(helpers.arrayPluck([], 'apple')).to.be.deep.equal([]);
			});
		});
		suite('regexInArray -', () => {
			let orig = ['apple', ' string ', 6, 4, 7];

			let cases = [
				{
					'Dollar sign is not in any of the array items': /\$/,
					'None of the numbers in the array match /5/': /5/
				}, {
					'\' string \' matches /^ ?string/': /^ ?string/,
					'\'apple\' matches /APPLE/i': /APPLE/i
				}
			];

			[0, 1].forEach(i => {
				let boolCase = cases[i];
				Object.keys(boolCase).forEach(desc => {
					test(desc, () => {
						if (i) {
							expect(helpers.regexInArray(orig, boolCase[desc])).to.be.true;
						} else {
							expect(helpers.regexInArray(orig, boolCase[desc])).to.be.false;
						}
					});
				});
			});

			test('First argument is not an array', () => {
				expect(helpers.regexInArray(5, /5/)).to.be.false;
			});
			test('Array is empty', () => {
				expect(helpers.regexInArray([], /.*/)).to.be.false;
			});
		});
		suite('upperCaseFirst -', () => {
			test('Capitalizes only the first letter of the string', () => {
				expect(helpers.upperCaseFirst('foobar')).to.equal('Foobar');
				expect(helpers.upperCaseFirst('FOOBAR')).to.equal('FOOBAR');
			});
		});
	});
});
