"use strict";

module.exports.tests = {
	'Get tests': {
		'Get with function': {
			select: ['id, COUNT(id) as count'],
			from: ['create_test'],
			groupBy: ['id'],
			get : []
		},
		'Basic select all get': {
			get: ['create_test']
		},
		'Basic select all with from': {
			from: ['create_test'],
			get: []
		},
		'Get with limit': {
			get: ['create_test', 2]
		},
		'Get with limit and offset': {
			get: ['create_test', 2, 1]
		},
		'Get with having': {
			select: ['id'],
			from: ['create_test'],
			groupBy: ['id'],
			having: [
				'multiple',
				[{'id >': 1}],
				['id !=', 3],
				['id', 900],
			],
			get: []
		},
		'Get with orHaving': {
			select: ['id'],
			from: ['create_test'],
			groupBy: ['id'],
			having: [{'id >': 1}],
			orHaving: ['id !=', 3],
			get: []
		}
	},
	'Select tests': {
		'Select where get': {
			select: [['id', 'key as k', 'val']],
			where: [
				'multiple',
				['id >', 1],
				['id <', 900]
			],
			get: ['create_test', 2, 1]
		},
		'Select where get 2': {
			select: ['id, key as k, val'],
			where: ['id !=', 1],
			get: ['create_test', 2, 1]
		},
		'Multi Order By': {
			from: ['create_test'],
			orderBy: ['id, key'],
			get: []
		},
		'Select get': {
			select: ['id, key as k, val'],
			get: ['create_test', 2, 1]
		},
		'Select from get': {
			select: ['id, key as k, val'],
			from: ['create_test ct'],
			where: ['id >', 1],
			get: []
		},
		'Select from limit get': {
			select: ['id, key as k, val'],
			from: ['create_test ct'],
			where: ['id >', 1],
			limit: [3],
			get: []
		},
		'Select where IS NOT NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			whereIsNotNull: ['id'],
			get: []
		},
		'Select where IS NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			whereIsNull: ['id'],
			get: []
		},
		'Select where OR IS NOT NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			whereIsNull: ['id'],
			orWhereIsNotNull: ['id'],
			get: []
		},
		'Select where OR IS NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			where: ['id', 3],
			orWhereIsNull: ['id'],
			get: []
		},
		'Select with string where value': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			where: ['id > 3'],
			get: []
		},
		'Select with function and argument in WHERE clause': {
			select: ['id'],
			from: ['create_test ct'],
			where: ['id', 'CEILING(SQRT(88))'],
			get: []
		}
	}
};



module.exports.runner = (tests, qb, callback) => {
	Object.keys(tests).forEach(suiteName => {
		suite(suiteName, () => {
			let currentSuite = tests[suiteName];
			Object.keys(currentSuite).forEach(testDesc => {
				test(testDesc, done => {
					let methodObj = currentSuite[testDesc];
					let methodNames = Object.keys(methodObj);
					let lastMethodIndex = methodNames[methodNames.length - 1];

					methodObj[lastMethodIndex].push((err, rows) => {
						callback(err, done);
					});

					methodNames.forEach(name => {
						let args = methodObj[name],
							method = qb[name];

						if (args[0] === 'multiple') {
							args.shift();
							args.forEach(argSet => {
								method.apply(qb, argSet);
							});

						} else {
							method.apply(qb, args);
						}
					});
				});
			});
		});
	});
};