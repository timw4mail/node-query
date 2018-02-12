const Helpers = require('../lib/Helpers');

describe('Helper Module Tests -', () => {
	describe('Type-checking methods -', () => {
		describe('Object wrappers are listed as their native type', () => {
			it('Boolean Wrapper returns \'boolean\' not \'object\'', () => {
				let item = Boolean(true);
				expect(Helpers.type(item)).toEqual('boolean');
			});
			it('Number Wrapper returns \'number\' not \'object\'', () => {
				let item = Number(4867);
				expect(Helpers.type(item)).toEqual('number');
			});
			it('String Wrapper returns \'string\' not \'object\'', () => {
				let item = String('Foo');
				expect(Helpers.type(item)).toEqual('string');
			});
		});
		describe('is..Method methods exist -', () => {
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
				it(`is${type} method exists`, () => {
					expect(Helpers[`is${type}`]).toBeDefined();
				});
			});
		});
		describe('isScalar -', () => {
			let trueCases = {
				'Strings are scalar': 'foo',
				'Booleans are scalar': true,
				'Numbers are scalar': 545
			};
			Object.keys(trueCases).forEach(desc => {
				it(desc, () => {
					expect(Helpers.isScalar(trueCases[desc])).toBe(true);
				});
			});

			let falseCases = {
				'Arrays are not scalar': [],
				'Objects are not scalar': []
			};
			Object.keys(falseCases).forEach(desc => {
				it(desc, () => {
					expect(Helpers.isScalar(falseCases[desc])).toBe(false);
				});
			});
		});
		describe('isInfinity -', () => {
			it('The type of 1/0 is infinity', () => {
				expect(Helpers.type(1 / 0)).toBe('infinity');
			});
			it('isInfinity is the same as isInfinite', () => {
				expect(Helpers.isInfinite(1 / 0)).toBe(true);
			});
		});
		describe('isNaN -', () => {
			it('The type of 0 / 0 is NaN', () => {
				expect(Helpers.type(0 / 0)).toBe('nan');
			});
			it('isNaN method agrees with type', () => {
				expect(Helpers.isNaN(0 / 0)).toBe(true);
			});
		});
	});
	describe('Other helper methods -', () => {
		describe('stringTrim -', () => {
			it('stringTrim method works as expected', () => {
				let orig = ['  x y ', 'z   ', ' q'];
				let ret = ['x y', 'z', 'q'];

				expect(orig.map(Helpers.stringTrim)).toEqual(ret);
			});
		});
		describe('arrayPluck -', () => {
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

			it('Finding members in all objects', () => {
				expect(Helpers.arrayPluck(orig, 'foo')).toEqual([1, 2, 3]);
			});
			it('Some members are missing in some objects', () => {
				expect(Helpers.arrayPluck(orig, 'bar')).toEqual([10, 15]);
			});
			it('Empty case', () => {
				expect(Helpers.arrayPluck([], 'apple')).toEqual([]);
			});
		});
		describe('regexInArray -', () => {
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
					it(desc, () => {
						if (i) {
							expect(Helpers.regexInArray(orig, boolCase[desc])).toBe(true);
						} else {
							expect(Helpers.regexInArray(orig, boolCase[desc])).toBe(false);
						}
					});
				});
			});

			it('First argument is not an array', () => {
				expect(Helpers.regexInArray(5, /5/)).toBe(false);
			});
			it('Array is empty', () => {
				expect(Helpers.regexInArray([], /.*/)).toBe(false);
			});
		});
		describe('upperCaseFirst -', () => {
			it('Capitalizes only the first letter of the string', () => {
				expect(Helpers.upperCaseFirst('foobar')).toBe('Foobar');
				expect(Helpers.upperCaseFirst('FOOBAR')).toBe('FOOBAR');
			});
		});
	});
});
