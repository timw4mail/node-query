/* eslint-env node, mocha */
'use strict';

// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
const expect = testBase.expect;
const testRunner = testBase.promiseTestRunner;

// Load the test config file
let adapterName = 'mysql2';
const config = testBase.config[adapterName];

// Set up the query builder object
let nodeQuery = reload('../../lib/NodeQuery')(config);
let qb = nodeQuery.getQuery();

describe('Mysql2 adapter tests -', () => {
	beforeAll(done => {
		qb.queryFile(`${__dirname}/../sql/mysql.sql`)
			.then(() => done())
			.catch(e => done(e));
	});

	it('nodeQuery.getQuery = nodeQuery.init', () => {
		expect(nodeQuery.getQuery())
			.to.be.deep.equal(qb);
	});

	testRunner(qb);
	it('Promise - Select with function and argument in WHERE clause', () => {
		let promise = qb.select('id')
			.from('create_test')
			.where('id', 'CEILING(SQRT(88))')
			.get();

		return expect(promise).to.be.fulfilled;
	});
	it('Test Truncate', () => {
		let promise = qb.truncate('create_test');
		return expect(promise).to.be.fullfilled;
	});
	it('Test Insert Batch', () => {
		let data = [
			{
				id: 5442,
				key: 4,
				val: Buffer.from('7')
			}, {
				id: 892,
				key: 35,
				val: Buffer.from('10 o\'clock')
			}, {
				id: 482,
				key: 404,
				val: 97
			}
		];

		return expect(qb.insertBatch('create_test', data)).to.be.fulfilled;
	});

	/* describeTeardown(() => {
		qb.end();
	}); */
});
