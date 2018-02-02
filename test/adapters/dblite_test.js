// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
const testRunner = testBase.promiseTestRunner;

// Load the test config file
const config = testBase.config;

// Set up the query builder object
let nodeQuery = require('../../lib/NodeQuery')(config.dblite);
let qb = nodeQuery.getQuery();

describe('Dblite adapter tests -', () => {
	beforeAll(done => {
		qb.queryFile(`${__dirname}/../sql/sqlite.sql`)
			.then(() => done())
			.catch(e => done(e));
	});

	testRunner(qb);
	it('Promise - Select with function and argument in WHERE clause', async () => {
		let promise = await qb.select('id')
			.from('create_test')
			.where('id', 'ABS(-88)')
			.get();

		expect(promise).toEqual(expect.anything());
	});
	it('Promise - Test Insert Batch', async () => {
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

		let promise = await qb.insertBatch('create_test', data);
		expect(promise).toEqual(expect.anything());
	});
	afterAll(() => {
		qb.end();
	});
});
