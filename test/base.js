// Load the test config file
const configFile = './config.json';

module.exports = {
	config: require(configFile),
	tests: require('./base/tests'),
	promiseTestRunner: require('./base/adapterPromiseTestRunner')
};
