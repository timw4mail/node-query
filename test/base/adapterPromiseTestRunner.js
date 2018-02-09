// Load the test base
const reload = require('require-reload')(require);
const tests = reload('../base/tests');

module.exports = function promiseTestRunner (qb) {
	Object.keys(tests).forEach(describeName => {
		describe(describeName, async () => {
			let currentSuite = tests[describeName];
			Object.keys(currentSuite).forEach(testDesc => {
				it(testDesc, done => {
					const methodObj = currentSuite[testDesc];
					const methodNames = Object.keys(methodObj);
					let results = [];

					methodNames.forEach(name => {
						const args = methodObj[name];
						const method = qb[name];

						if (args[0] === 'multiple') {
							args.shift();
							args.forEach(argSet => {
								results.push(method.apply(qb, argSet));
							});
						} else {
							results.push(method.apply(qb, args));
						}
					});

					const promise = results.pop();
					promise.then(result => {
						// expect(result.rows).is.an('array');
						expect(result.rowCount()).toEqual(expect.anything());
						expect(result.columnCount()).toEqual(expect.anything());
						return done();
					}).catch(e => done(e));
				});
			});
		});
	});

	describe('DB update tests -', () => {
		beforeAll(done => {
			let sql = qb.driver.truncate('create_test');
			qb.query(sql).then(() => done())
				.catch(err => done(err));
		});
		it('Test Insert', async () => {
			const promise = await qb.set('id', 98)
				.set('key', '84')
				.set('val', Buffer.from('120'))
				.insert('create_test');

			expect(promise).toEqual(expect.anything());
		});
		it('Test Insert Object', async () => {
			const promise = await qb.insert('create_test', {
				id: 587,
				key: 1,
				val: Buffer.from('2')
			});

			expect(promise).toEqual(expect.anything());
		});
		it('Test Update', async () => {
			const promise = await qb.where('id', 7)
				.update('create_test', {
					id: 7,
					key: 'gogle',
					val: Buffer.from('non-word')
				});

			expect(promise).toEqual(expect.anything());
		});
		it('Test set Array Update', async () => {
			let object = {
				id: 22,
				key: 'gogle',
				val: Buffer.from('non-word')
			};

			const promise = await qb.set(object)
				.where('id', 22)
				.update('create_test');

			expect(promise).toEqual(expect.anything());
		});
		it('Test where set update', async () => {
			const promise = await qb.where('id', 36)
				.set('id', 36)
				.set('key', 'gogle')
				.set('val', Buffer.from('non-word'))
				.update('create_test');

			expect(promise).toEqual(expect.anything());
		});
		it('Test delete', async () => {
			const promise = await qb.delete('create_test', {id: 5});
			expect(promise).toEqual(expect.anything());
		});
		it('Delete with where', async () => {
			const promise = await qb.where('id', 5)
				.delete('create_test');

			expect(promise).toEqual(expect.anything());
		});
		it('Delete multiple where values', async () => {
			const promise = await qb.delete('create_test', {
				id: 5,
				key: 'gogle'
			});

			expect(promise).toEqual(expect.anything());
		});
	});

	describe('Batch tests -', () => {
		it('Test Insert Batch', async () => {
			const data = [
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

			const promise = await qb.insertBatch('create_test', data);
			expect(promise).toEqual(expect.anything());
		});
		it('Test Update Batch', async () => {
			const data = [{
				id: 480,
				key: 49,
				val: '7x7'
			}, {
				id: 890,
				key: 100,
				val: '10x10'
			}];

			const affectedRows = qb.updateBatch('create_test', data, 'id');
			expect(affectedRows).toBe(2);
		});
	});

	describe('Grouping tests -', () => {
		it('Using grouping method', async () => {
			const promise = await qb.select('id, key as k, val')
				.from('create_test')
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.limit(2, 1)
				.get();

			expect(promise).toEqual(expect.anything());
		});
		it('Using where first grouping', async () => {
			const promise = await qb.select('id, key as k, val')
				.from('create_test')
				.where('id !=', 5)
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.limit(2, 1)
				.get();

			expect(promise).toEqual(expect.anything());
		});
		it('Using or grouping method', async () => {
			const promise = await qb.select('id, key as k, val')
				.from('create_test')
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.orGroupStart()
				.where('id', 0)
				.groupEnd()
				.limit(2, 1)
				.get();

			expect(promise).toEqual(expect.anything());
		});
		it('Using or not grouping method', async () => {
			const promise = await qb.select('id, key as k, val')
				.from('create_test')
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.orNotGroupStart()
				.where('id', 0)
				.groupEnd()
				.limit(2, 1)
				.get();

			expect(promise).toEqual(expect.anything());
		});
	});
	describe('Get compiled - ', () => {
		it('getCompiledSelect', () => {
			const sql = qb.select('id, key as k, val')
				.from('create_test')
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.limit(2, 1)
				.getCompiledSelect();

			expect(sql).toMatchSnapshot();
		});
		it('getCompiledSelect 2', () => {
			const sql = qb.select('id, key as k, val')
				.groupStart()
				.where('id >', 1)
				.where('id <', 900)
				.groupEnd()
				.limit(2, 1)
				.getCompiledSelect('create_test');

			expect(sql).toMatchSnapshot();
		});
		it('getCompiledInsert', () => {
			const sql = qb.set({
				id: 587,
				key: 1,
				val: Buffer.from('2')
			}).getCompiledInsert('create_test');

			expect(sql).toMatchSnapshot();
		});
		it('getCompiledUpdate', () => {
			const sql = qb.where('id', 36)
				.set('id', 36)
				.set('key', 'gogle')
				.set('val', Buffer.from('non-word'))
				.getCompiledUpdate('create_test');

			expect(sql).toMatchSnapshot();
		});
		it('getCompiledDelete', () => {
			const sql = qb.where({id: 5}).getCompiledDelete('create_test');
			expect(sql).toMatchSnapshot();
		});
	});
};
