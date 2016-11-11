'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

// Load the test config file
const configFile = './config.json';

module.exports = {
	config: require(configFile),
	expect: chai.expect,
	tests: require('./base/tests'),
	promiseTestRunner: require('./base/adapterPromiseTestRunner')
};
