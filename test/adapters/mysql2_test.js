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
	it('Select with function and argument in WHERE clause', async () => {
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
	afterAll(() => {
		qb.end();
	});
});
