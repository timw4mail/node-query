const reload = require('require-reload')(require);
const glob = require('glob');
const nodeQuery = reload('../lib/NodeQuery')();
const Adapter = reload('../lib/Adapter');

describe('Base tests -', () => {
	describe('Sanity check', () => {
		let files = glob.sync(`${__dirname}/../lib/**/*.js`);
		files.forEach(mod => {
			let obj = require(mod);
			let shortName = mod.replace(/^\/(.*?)\/lib\/(.*?)\.js$/g, '$2');
			it(`${shortName} module is sane`, () => {
				expect(obj).toEqual(expect.anything());
			});
		});
	});

	it('NodeQuery.getQuery with no instance', () => {
		// Hack for testing to work around node
		// module caching
		let nodeQueryCopy = Object.create(nodeQuery);
		nodeQueryCopy.instance = null;
		expect(() => {
			nodeQueryCopy.getQuery();
		}).toThrow(Error, 'No Query Builder instance to return');
	});

	it('Invalid driver type', () => {
		expect(() => {
			reload('../lib/NodeQuery')({
				driver: 'Foo'
			});
		}).toThrow(Error, 'Selected driver (Foo) does not exist!');
	});

	it('Invalid adapter', () => {
		expect(() => {
			let a = new Adapter();
			a.execute();
		}).toThrow(Error, 'Correct adapter not defined for query execution');
	});

	it('Invalid adapter - missing transformResult', () => {
		expect(() => {
			let a = new Adapter();
			a.transformResult([]);
		}).toThrow(Error, 'Result transformer method not defined for current adapter');
	});
});
