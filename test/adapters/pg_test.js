'use strict';

// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
const expect =  testBase.expect;
const promiseTestRunner = testBase.promiseTestRunner;
const testRunner = testBase.testRunner;

// Load the test config file
let adapterName = 'pg';
const allConfig = testBase.config;
const config = allConfig[adapterName];

// Set up the query builder object
let nodeQuery = reload('../../lib/NodeQuery')(config);
let qb = nodeQuery.getQuery();
let qb2 = null;

suite('Pg adapter tests -', () => {
	test('nodeQuery.getQuery = nodeQuery.init', () => {
		expect(nodeQuery.getQuery())
			.to.be.deep.equal(qb);
	});

	test('Connecting with an object also works', () => {
		let config = allConfig[`${adapterName}-object`];
		let nodeQuery = reload('../../lib/NodeQuery')(config);
		qb2 = nodeQuery.getQuery();

		return expect(qb2).to.be.ok;
	});

	//--------------------------------------------------------------------------
	// Callback Tests
	//--------------------------------------------------------------------------
	testRunner(qb, (err, result, done) => {
		expect(err).is.not.ok;
		expect(result.rows).is.an('array');
		expect(result.rowCount()).to.not.be.undefined;
		expect(result.columnCount()).to.not.be.undefined;
		done();
	});
	test('Callback - Select with function and argument in WHERE clause', done => {
		qb.select('id')
			.from('create_test')
			.where('id', 'CEILING(SQRT(88))')
			.get((err, rows) => {
				expect(rows).is.ok;
				expect(err).is.not.ok;
				return done(err);
			});
	});
	test('Callback - Test Insert Batch', done => {
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

		qb.insertBatch('create_test', data, (err, res) => {
			expect(err).is.not.ok;
			return done(err);
		});
	});

	//--------------------------------------------------------------------------
	// Promise Tests
	//--------------------------------------------------------------------------
	promiseTestRunner(qb);
	test('Promise - Select with function and argument in WHERE clause', () => {
		let promise = qb.select('id')
			.from('create_test')
			.where('id', 'CEILING(SQRT(88))')
			.get();

		return expect(promise).to.be.fulfilled;
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
	suiteTeardown(() => {
		qb.end();
		qb2.end();
	});
});