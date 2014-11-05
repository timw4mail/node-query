'use strict';

var helpers = require('../lib/helpers');

var helperTests = {
	'Type checking method tests' : {
		"Object wrappers are listed as their native type": function(test) {
			test.deepEqual('boolean', helpers.type(new Boolean(true)), "Boolean Wrapper returns 'boolean' not 'object'");
			test.deepEqual('number', helpers.type(new Number(4867)), "Number Wrapper returns 'number' not 'object");
			test.deepEqual('string', helpers.type(new String("Foo")), "String Wrapper returns 'string' not 'object'");
			test.done();
		}
	},
	'is..Method tests exist' : function(test) {
		test.expect(11);

		var types = ['Null','Undefined','Object','Array','String','Number','Boolean','Function','RegExp','NaN','Infinite'];

		types.forEach(function(type) {
			test.ok(helpers['is' + type], 'is' + type + ' method exists');
		});

		test.done();
	},
	'isNaN': function(test) {
		test.expect(2);
		test.equal(helpers.type(0 / 0), 'nan');
		test.deepEqual(helpers.isNaN(0 / 0), true);

		test.done();
	},
	'isInfinity': function(test) {
		test.expect(2);

		test.equal(helpers.type(1/0), 'infinity');
		test.deepEqual(helpers.isInfinite(1/0), true);
		test.done();
	},
	'stringTrim': function(test) {
		test.expect(1);

		var orig = ['  x y ', 'z   ', ' q'];
		var ret = ['x y', 'z', 'q'];

		test.deepEqual(ret, orig.map(helpers.stringTrim));

		test.done();
	},
	'arrayPluck': function(test) {
		test.expect(3);

		var orig = [{
			foo: 1
		},{
			foo: 2,
			bar: 10
		},{
			foo: 3,
			bar: 15
		}];

		test.deepEqual([1,2,3], helpers.arrayPluck(orig, 'foo'), 'Finding members in all objects');
		test.deepEqual([10,15], helpers.arrayPluck(orig, 'bar'), 'Some members are missing in some objects');

		// Empty case
		test.deepEqual([], helpers.arrayPluck([], 'apple'));

		test.done();
	},
	'regexInArray': function(test) {
		var orig = ['apple', ' string ', 6, 4, 7];

		test.expect(4);

		test.equal(false, helpers.regexInArray(orig, /\$/), 'Dollar sign is not in any of the array items');
		test.equal(true, helpers.regexInArray(orig, /^ ?string/), "' string ' matches /^ ?string/");
		test.equal(true, helpers.regexInArray(orig, /APPLE/i), "'apple' matches /APPLE/i");
		test.equal(false, helpers.regexInArray(orig, /5/), 'None of the numbers in the array match /5/');

		test.done();
	}
};


module.exports = helperTests;