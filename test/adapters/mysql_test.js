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
let adapterName = 'mysql';
let config = reload(configFile)[adapterName];

// Set up the connection
let mysql = reload(adapterName);
let connection = mysql.createConnection(config.conn);

// Set up the query builder object
let nodeQuery = reload('../../lib/NodeQuery');
let qb = nodeQuery.init('mysql', connection);

suite('Mysql adapter tests -', () => {
	require('./mysql-base')(qb, nodeQuery, expect, testRunner, promiseTestRunner);
});