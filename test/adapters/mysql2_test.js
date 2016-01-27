'use strict';

const configFile = (process.env.CI) ? '../config-travis.json' : '../config.json';

// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
const expect =  testBase.expect,
	promiseTestRunner = testBase.promiseTestRunner,
	testRunner = testBase.testRunner;

let getArgs = reload('getargs');

// Load the test config file
let adapterName = 'mysql2';
let config = reload(configFile)[adapterName];

// Set up the connection
let mysql2 = reload(adapterName);
let connection = mysql2.createConnection(config.conn);

// Set up the query builder object
let nodeQuery = reload('../../lib/NodeQuery');
let qb = nodeQuery.init('mysql', connection, adapterName);

suite('Mysql2 adapter tests -', () => {
	require('./mysql-base')(qb, nodeQuery, expect, testRunner, promiseTestRunner);
});