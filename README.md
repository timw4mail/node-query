#CI-Node-query

A node query builder for various SQL databases, based on CodeIgniter's query builder.

[![Build Status](https://travis-ci.org/timw4mail/node-query.svg?branch=master)](https://travis-ci.org/timw4mail/node-query)

### Supported adapters
	
* mysql
* mysql2
* pg

### Installation

	npm install ci-node-query

### Basic use

	var nodeQuery = require('ci-node-query');
	
	var connection = ... // Database module connection 
	
	// Three arguments: database type, database connection, database connection library
	var query = nodeQuery('mysql', connection, 'mysql2');

	query.select('foo')
		.from('bar')
		.where('x', 3)
		.orWhere({y: 2})
		.join('baz', 'baz.boo = bar.foo', 'left')
		.orderBy('x', 'DESC')
		.limit(2, 3)
		.get(function(/* Adapter dependent arguments */) {
			// Database module result handling
		});
		
### Additional help

* Generated documentation is in the docs/ folder 
* `tests/query-builder-base.js`	contains a lot of usage examples
* The `tests/adapters` folder contains examples of how to set up a connection for the appropriate database library

