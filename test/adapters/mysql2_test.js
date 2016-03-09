'use strict';

const configFile = (process.env.TRAVIS) ? '../config-travis.json' : '../config.json';

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
qb.query(qb.driver.truncate('create_test')).then(() => {
	suite('Mysql2 adapter tests -', () => {

		require('./mysql-base')(qb, nodeQuery, expect, testRunner, promiseTestRunner);

		test('Test Insert Batch', done => {
			let data = [
				{
					id: 5441,
					key: 3,
					val: new Buffer('7'),
				}, {
					id: 891,
					key: 34,
					val: new Buffer('10 o\'clock'),
				}, {
					id: 481,
					key: 403,
					val: new Buffer('97'),
				},
			];

			qb.insertBatch('create_test', data, (err, rows) => {
				expect(err).is.not.ok;
				return done();
			});
		});
	});
});