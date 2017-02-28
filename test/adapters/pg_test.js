/* eslint-env node, mocha */
'use strict';

// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
const expect = testBase.expect;
const testRunner = testBase.promiseTestRunner;

// Load the test config file
let adapterName = 'pg';
const allConfig = testBase.config;
const config = allConfig[adapterName];

// Set up the query builder object
let nodeQuery = reload('../../lib/NodeQuery')(config);
let qb = nodeQuery.getQuery();
let qb2 = null;

describe('Pg adapter tests -', () => {
	it('nodeQuery.getQuery = nodeQuery.init', () => {
		expect(nodeQuery.getQuery())
			.to.be.deep.equal(qb);
	});

	it('Connecting with an object also works', () => {
		let config = allConfig[`${adapterName}-object`];
		let nodeQuery = reload('../../lib/NodeQuery')(config);
		qb2 = nodeQuery.getQuery();

		expect(qb2).to.be.ok;
	});

	it('Test Connection Error', done => {
		try {
			reload('../../lib/NodeQuery')({});
			done(true);
		} catch (e) {
			expect(e).to.be.ok;
			expect(e).is.an('Error');
			done();
		}
	});

	testRunner(qb);
	it('Promise - Select with function and argument in WHERE clause', () => {
		let promise = qb.select('id')
			.from('create_test')
			.where('id', 'CEILING(SQRT(88))')
			.get();

		return expect(promise).to.be.fulfilled;
	});
	it('Promise - Test Truncate', () => {
		let promise = qb.truncate('create_test');
		return expect(promise).to.be.fulfilled;
	});
	it('Promise - Test Insert Batch', () => {
		let data = [
			{
				id: 544,
				key: 3,
				val: Buffer.from('7')
			}, {
				id: 89,
				key: 34,
				val: Buffer.from('10 o\'clock')
			}, {
				id: 48,
				key: 403,
				val: Buffer.from('97')
			}
		];

		let promise = qb.insertBatch('create_test', data);
		return expect(promise).to.be.fulfilled;
	});
	afterAll(() => {
		qb.end();
		qb2.end();
	});
});
