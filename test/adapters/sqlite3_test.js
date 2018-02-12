// Load the test base
const reload = require('require-reload')(require);
reload.emptyCache();
const testBase = reload('../base');
const testRunner = testBase.promiseTestRunner;

// Load the test config file
const config = testBase.config;

// Set up the query builder object
let nodeQuery = require('../../lib/NodeQuery')(config.sqlite3);
let qb = nodeQuery.getQuery();

describe('Sqlite3 adapter tests -', () => {
	beforeAll(done => {
		// Set up the sqlite database
		qb.queryFile(`${__dirname}/../sql/sqlite.sql`)
			.then(() => done())
			.catch(e => done(e));
	});

	testRunner(qb);
	it('Select with function and argument in WHERE clause', async () => {
		let promise = await qb.select('id')
			.from('create_test')
			.where('id', 'ABS(-88)')
			.get();

		expect(promise).toEqual(expect.anything());
	});
	afterAll(() => {
		qb.end();
	});
});
