'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

module.exports = {
	expect: chai.expect,
	tests: require('./base/tests'),
	testRunner: require('./base/adapterCallbackTestRunner'),
	promiseTestRunner: require('./base/adapterPromiseTestRunner'),
};