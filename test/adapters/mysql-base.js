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
	test('Test Insert Batch', done => {
		let data = [
			{
				id: 544,
				key: 3,
				val: new Buffer('7'),
			}, {
				id: 89,
				key: 34,
				val: new Buffer('10 o\'clock'),
			}, {
				id: 48,
				key: 403,
				val: new Buffer('97'),
			},
		];

		qb.insertBatch('create_test', data, (err, rows) => {
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