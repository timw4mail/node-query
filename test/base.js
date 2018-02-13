// Load the test config file
const configFile = process.env.CI ? './config-ci.json' : './config.json';
const config = require(configFile);

if (process.env.CI !== undefined) {
	console.log(config);
}

module.exports = {
	config,
	tests: require('./base/tests'),
	promiseTestRunner: require('./base/adapterPromiseTestRunner')
};
