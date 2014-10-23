#Node-query

A node query builder for various SQL databases, based on CodeIgniter's query builder.

### Basic use

	var nodeQuery = require('node-query');
	
	var mysql = ... // Database module connection 
	
	// Three arguments: database type, database connection, database connection library
	var query = nodeQuery('mysql', mysql, 'mysql2');

	query.select('foo')
		.from('bar')
		.where('x', 3)
		.orWhere('y', 2)
		.orderBy('x')
		.limit(2, 3)
		.get(function(err, result) {
			// Database module result handling
		});

