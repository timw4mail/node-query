'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

module.exports = {
	expect: expect,
	tests: require('./base/tests'),
	testRunner: require('./base/adapterCallbackTestRunner'),
	promiseTestRunner: require('./base/adapterPromiseTestRunner'),
};