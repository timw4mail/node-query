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
	}
};


module.exports = helperTests;