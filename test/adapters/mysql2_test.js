'use strict';

const configFile = (process.env.TRAVIS) ? '../config-travis.json' : '../config.json';

// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
const expect =  testBase.expect;
const promiseTestRunner = testBase.promiseTestRunner;
const testRunner = testBase.testRunner;

let getArgs = reload('getargs');

// Load the test config file
let adapterName = 'mysql2';
let config = reload(configFile)[adapterName];

// Set up the query builder object
let nodeQuery = reload('../../lib/NodeQuery')(config);
let qb = nodeQuery.getQuery();
qb.query(qb.driver.truncate('create_test')).then(() => {
	suite('Mysql2 adapter tests -', () => {

		test('nodeQuery.getQuery = nodeQuery.init', () => {
			expect(nodeQuery.getQuery())
				.to.be.deep.equal(qb);
		});

		/*---------------------------------------------------------------------------
		Callback Tests
		---------------------------------------------------------------------------*/
		testRunner(qb, (err, done) => {
			expect(err).is.not.ok;
			done();
		});
		test('Callback - Select with function and argument in WHERE clause', done => {
			qb.select('id')
				.from('create_test')
				.where('id', 'CEILING(SQRT(88))')
				.get((err, rows) => {
					expect(err).is.not.ok;
					return done();
				});
		});

		/*---------------------------------------------------------------------------
		Promise Tests
		---------------------------------------------------------------------------*/
		promiseTestRunner(qb);
		test('Promise - Select with function and argument in WHERE clause', () => {
			let promise = qb.select('id')
				.from('create_test')
				.where('id', 'CEILING(SQRT(88))')
				.get();

			expect(promise).to.be.fulfilled;
		});

		suiteTeardown(() => {
			qb.end();
		});

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