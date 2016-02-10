'use strict';

module.exports = function mysqlBase(qb, nodeQuery, expect, testRunner, promiseTestRunner) {
	test('nodeQuery.getQuery = nodeQuery.init', () => {
		expect(nodeQuery.getQuery())
			.to.be.deep.equal(qb);
	});

	/*---------------------------------------------------------------------------
	Callback Tests
	---------------------------------------------------------------------------*/
	testRunner(qb, (err, done) => {
		expect(err).is.not.ok;
		done();
	});
	test('Callback - Select with function and argument in WHERE clause', done => {
		qb.select('id')
			.from('create_test')
			.where('id', 'CEILING(SQRT(88))')
			.get((err, rows) => {
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
			.where('id', 'CEILING(SQRT(88))')
			.get();

		expect(promise).to.be.fulfilled;
	});

	suiteTeardown(() => {
		qb.end();
	});
};