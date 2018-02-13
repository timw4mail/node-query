// Load the test config file
const configFile = process.env.CI ? './config-ci.json': './config.json';

module.exports = {
	config: require(configFile),
	tests: require('./base/tests'),
	promiseTestRunner: require('./base/adapterPromiseTestRunner')
};
