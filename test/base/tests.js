'use strict';

// jscs:disable
module.exports = {
	'Get tests -': {
		'Get with function': {
			select: ['id, COUNT(id) as count'],
			from: ['create_test'],
			groupBy: ['id'],
			get: [],
		},
		'Basic select all get': {
			get: ['create_test'],
		},
		'Basic select all with from': {
			from: ['create_test'],
			get: [],
		},
		'Get with limit': {
			get: ['create_test', 2],
		},
		'Get with limit and offset': {
			get: ['create_test', 2, 1],
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
			get: [],
		},
		'Get with orHaving': {
			select: ['id'],
			from: ['create_test'],
			groupBy: ['id'],
			having: [{'id >': 1}],
			orHaving: ['id !=', 3],
			get: [],
		},
	},
	'Select tests -': {
		'Select where get': {
			select: [['id', 'key as k', 'val']],
			where: [
				'multiple',
				['id >', 1],
				['id <', 900],
			],
			get: ['create_test', 2, 1],
		},
		'Select where get 2': {
			select: ['id, key as k, val'],
			where: ['id !=', 1],
			get: ['create_test', 2, 1],
		},
		'Multi Order By': {
			from: ['create_test'],
			orderBy: ['id, key'],
			get: [],
		},
		'Select get': {
			select: ['id, key as k, val'],
			get: ['create_test', 2, 1],
		},
		'Select from get': {
			select: ['id, key as k, val'],
			from: ['create_test ct'],
			where: ['id >', 1],
			get: [],
		},
		'Select from limit get': {
			select: ['id, key as k, val'],
			from: ['create_test ct'],
			where: ['id >', 1],
			limit: [3],
			get: [],
		},
		'Select where IS NOT NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			whereIsNotNull: ['id'],
			get: [],
		},
		'Select where IS NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			whereIsNull: ['id'],
			get: [],
		},
		'Select where OR IS NOT NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			whereIsNull: ['id'],
			orWhereIsNotNull: ['id'],
			get: [],
		},
		'Select where OR IS NULL': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			where: ['id', 3],
			orWhereIsNull: ['id'],
			get: [],
		},
		'Select with string where value': {
			select: ['id', 'key as k', 'val'],
			from: ['create_test ct'],
			where: ['id > 3'],
			get: [],
		},
	},
	'Where in tests -': {
		'Where in': {
			from: ['create_test'],
			whereIn: ['id', [0, 6, 56, 563, 341]],
			get: [],
		},
		'Or Where in': {
			from: ['create_test'],
			where: ['key', 'false'],
			orWhereIn: ['id', [0, 6, 56, 563, 341]],
			get: [],
		},
		'Where Not in': {
			from: ['create_test'],
			where: ['key', 'false'],
			whereNotIn: ['id', [0, 6, 56, 563, 341]],
			get: [],
		},
		'Or Where Not in': {
			from: ['create_test'],
			where: ['key', 'false'],
			orWhereNotIn: ['id', [0, 6, 56, 563, 341]],
			get: [],
		},
	},
	'Query modifier tests -': {
		'Order By': {
			select: ['id, key as k, val'],
			from: ['create_test'],
			where: [
				'multiple',
				['id >', 0],
				['id <', 9000],
			],
			orderBy: [
				'multiple',
				['id', 'DESC'],
				['k', 'ASC'],
			],
			limit: [5, 2],
			get: [],
		},
		'Group By': {
			select: ['id, key as k, val'],
			from: ['create_test'],
			where: [
				'multiple',
				['id >', 0],
				['id <', 9000],
			],
			groupBy: [
				'multiple',
				['k'],
				[['id', 'val']],
			],
			orderBy: [
				'multiple',
				['id', 'DESC'],
				['k', 'ASC'],
			],
			limit: [5, 2],
			get: [],
		},
		'Or Where': {
			select: ['id, key as k, val'],
			from: ['create_test'],
			where: [' id ', 1],
			orWhere: ['key > ', 0],
			limit: [2, 1],
			get: [],
		},
		Like: {
			from: ['create_test'],
			like: ['key', 'og'],
			get: [],
		},
		'Or Like': {
			from: ['create_test'],
			like: ['key', 'og'],
			orLike: ['key', 'val'],
			get: [],
		},
		'Not Like': {
			from: ['create_test'],
			like: ['key', 'og', 'before'],
			notLike: ['key', 'val'],
			get: [],
		},
		'Or Not Like': {
			from: ['create_test'],
			like: ['key', 'og', 'before'],
			orNotLike: ['key', 'val'],
			get: [],
		},
		'Like Before': {
			from: ['create_test'],
			like: ['key', 'og', 'before'],
			get: [],
		},
		'Like After': {
			from: ['create_test'],
			like: ['key', 'og', 'after'],
			get: [],
		},
		'Basic Join': {
			from: ['create_test ct'],
			join: ['create_join cj', 'cj.id=ct.id'],
			get: [],
		},
		'Left Join': {
			from: ['create_test ct'],
			join: ['create_join cj', 'cj.id=ct.id', 'left'],
			get: [],
		},
		'Inner Join': {
			from: ['create_test ct'],
			join: ['create_join cj', 'cj.id=ct.id', 'inner'],
			get: [],
		},
		'Join with multiple where values': {
			from: ['create_test ct'],
			join: ['create_join cj', 'cj.id=ct.id', 'inner'],
			where: [
				{
					'ct.id < ': 3,
					'ct.key ': 'foo',
				},
			],
			get: [],
		},
	},
};