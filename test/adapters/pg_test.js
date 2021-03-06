// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
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
	beforeAll(done => {
		qb.queryFile(`${__dirname}/../sql/pgsql.sql`)
			.then(() => done())
			.catch(e => done(e));
	});

	it('nodeQuery.getQuery = nodeQuery.init', () => {
		expect(nodeQuery.getQuery())
			.toEqual(qb);
	});

	it('Connecting with an object also works', () => {
		let config = allConfig[`${adapterName}-object`];
		let nodeQuery = reload('../../lib/NodeQuery')(config);
		qb2 = nodeQuery.getQuery();

		expect(qb2).toEqual(expect.anything());
	});

	it('Test Connection Error', done => {
		try {
			reload('../../lib/NodeQuery')({});
			done(true);
		} catch (e) {
			expect(e).toEqual(expect.anything());
			done();
		}
	});

	testRunner(qb);
	it('Select with function and argument in WHERE clause', async () => {
		const promise = await qb.select('id')
			.from('create_test')
			.where('id', 'CEILING(SQRT(88))')
			.get();

		expect(promise).toEqual(expect.anything());
	});
	it('Test Truncate', async () => {
		const promise = await qb.truncate('create_test');
		expect(promise).toEqual(expect.anything());
	});
	afterAll(() => {
		qb.end();
		qb2.end();
	});
});
