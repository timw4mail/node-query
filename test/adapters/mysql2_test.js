// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
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
		expect(nodeQuery.getQuery()).toEqual(qb);
	});

	testRunner(qb);
	it('Promise - Select with function and argument in WHERE clause', async () => {
		let promise = await qb.select('id')
			.from('create_test')
			.where('id', 'CEILING(SQRT(88))')
			.get();

		expect(promise).toEqual(expect.anything());
	});
	it('Test Truncate', async () => {
		let promise = await qb.truncate('create_test');
		expect(promise).toEqual(expect.anything());
	});
	it('Test Insert Batch', async () => {
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

		const promise = await qb.insertBatch('create_test', data);
		expect(promise).toEqual(expect.anything());
	});

	/* describeTeardown(() => {
		qb.end();
	}); */
});
