'use strict';

let configFile = (process.env.CI) ? '../config-travis.json' : '../config.json';

// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
const expect =  testBase.expect,
	promiseTestRunner = testBase.promiseTestRunner,
	testRunner = testBase.testRunner;

// Load the test config file
let adapterName = 'pg';
let config = reload(configFile)[adapterName];

// Set up the connection
let pg = reload(adapterName);
let connection = new pg.Client(config.conn);
connection.connect(err => {
	if (err) {
		throw new Error(err);
	}
});

// Set up the query builder object
let nodeQuery = reload('../../lib/NodeQuery');
let qb = nodeQuery.init('pg', connection);

suite('Pg adapter tests -', () => {
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
	test('Promise - Test Insert Batch', () => {
		let data = [
			{
				id: 544,
				key: 3,
				val: new Buffer('7'),
			}, {
				id: 89,
				key: 34,
				val: new Buffer('10 o\'clock'),
			}, {
				id: 48,
				key: 403,
				val: new Buffer('97'),
			},
		];

		let promise = qb.insertBatch('create_test', data);
		return expect(promise).to.be.fulfilled;
	});
});