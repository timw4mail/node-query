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
	}
};


module.exports = helperTests;