'use strict';

// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const fs = require('fs');
const testBase = reload('../base');
const expect =  testBase.expect;
const promiseTestRunner = testBase.promiseTestRunner;
const testRunner = testBase.testRunner;
let tests = reload('../base/tests');

// Load the test config file
const configFile = (process.env.TRAVIS) ? '../config-travis.json' : '../config.json';
const config = reload(configFile);

// Set up the query builder object
let nodeQuery = require('../../lib/NodeQuery')(config.dblite);
let qb = nodeQuery.getQuery();

suite('Dblite adapter tests -', () => {
	suiteSetup(done => {
		// Set up the sqlite database
		fs.readFile(`${__dirname}/../sql/sqlite.sql`, 'utf8', (err, data) => {
			if (err) {
				return done(err);
			}

			qb.query(data, () => done());
		});
	});

	/*---------------------------------------------------------------------------
	Callback Tests
	---------------------------------------------------------------------------*/

	testRunner(qb, (err, result, done) => {
		expect(err).is.not.ok;
		expect(result.rows).is.an('array');
		expect(result.columns).is.an('array');
		expect(result.rowCount()).to.not.be.undefined;
		expect(result.columnCount()).to.not.be.undefined;
		done();
	});
	test('Callback - Select with function and argument in WHERE clause', done => {
		qb.select('id')
			.from('create_test')
			.where('id', 'ABS(-88)')
			.get((err, rows) => {
				expect(err).is.not.ok;
				return done();
			});
	});
	test('Callback - Test Insert Batch', done => {
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

		qb.insertBatch('create_test', data, err => {
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
			.where('id', 'ABS(-88)')
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

		let promise = qb.query(qb.driver.truncate('create_test')).then(
			() => qb.insertBatch('create_test', data)
		);
		expect(promise).to.be.fulfilled;
	});
	suiteTeardown(() => {
		qb.end();
	});
});
