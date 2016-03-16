'use strict';

let expect = require('chai').expect,
	reload = require('require-reload')(require),
	glob = require('glob'),
	nodeQuery = reload('../lib/NodeQuery')(),
	Adapter = reload('../lib/Adapter');

suite('Base tests -', () => {
	suite('Sanity check', () => {
		let files = glob.sync(`${__dirname}/../lib/**/*.js`);
		files.forEach(mod => {
			let obj = require(mod);
			let shortName = mod.replace(/^\/(.*?)\/lib\/(.*?)\.js$/g, '$2');
			test(`${shortName} module is sane`, () => {
				expect(obj).to.be.ok;
			});
		});
	});

	test('NodeQuery.getQuery with no instance', () => {
		// Hack for testing to work around node
		// module caching
		let nodeQueryCopy = Object.create(nodeQuery);
		nodeQueryCopy.instance = null;
		expect(() => {
			nodeQueryCopy.getQuery();
		}).to.throw(Error, 'No Query Builder instance to return');
	});

	test('Invalid driver type', () => {
		expect(() => {
			reload('../lib/NodeQuery')({
				driver: 'Foo',
			});
		}).to.throw(Error, 'Selected driver (Foo) does not exist!');
	});

	test('Invalid adapter', () => {
		expect(() => {
			let a = new Adapter();
			a.execute();
		}).to.throw(Error, 'Correct adapter not defined for query execution');
	});

	test('Invalid adapter - missing transformResult', () => {
		expect(() => {
			let a = new Adapter();
			a.transformResult([]);
		}).to.throw(Error, 'Result transformer method not defined for current adapter');
	});
});