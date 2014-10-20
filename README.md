#Node-query

A node query builder for various SQL databases, based on CodeIgniter's query builder.

### Probable use

	var query = require('node-query');

	var res = query
		.select('foo')
		.from('bar')
		.where('x', 3)
		.orWhere('y', 2)
		.orderBy('x')
		.limit(2, 3)
		.get();

