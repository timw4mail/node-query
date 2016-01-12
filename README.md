#CI-Node-query

A node query builder for various SQL databases, based on CodeIgniter's query builder.

[![Build Status](https://jenkins.timshomepage.net/buildStatus/icon?job=node-query)](https://jenkins.timshomepage.net/job/node-query/)
[![Build Status](https://travis-ci.org/timw4mail/node-query.svg?branch=master)](https://travis-ci.org/timw4mail/node-query)
[![Code Climate](https://codeclimate.com/github/timw4mail/node-query/badges/gpa.svg)](https://codeclimate.com/github/timw4mail/node-query)
[![Test Coverage](https://codeclimate.com/github/timw4mail/node-query/badges/coverage.svg)](https://codeclimate.com/github/timw4mail/node-query/coverage)

### Supported adapters

* mysql
* mysql2
* pg
* dblite
* node-firebird

### Installation

	npm install ci-node-query

### Basic use

	var nodeQuery = require('ci-node-query');

	var connection = ... // Database module connection

	// Three arguments: database type, database connection, database connection library
	var query = nodeQuery.init('mysql', connection, 'mysql2');

	// The third argument is optional if the database connection library has the same name as the adapter, eg..
	nodeQuery.init('mysql', connection, 'mysql');
	// Can be instead
	nodeQuery.init('mysql', connection);

	// You can also retrieve the instance later
	query = nodeQuery.getQuery();

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

### Security notes
As of version 2, `where` and `having` type methods parse the values passed to look for function calls. While values passed are still passed as query parameters, take care to avoid passing these kinds of methods unfiltered input. SQL function arguments are not currently parsed, so they need to be properly escaped for the current database.


### Additional help

* Generated documentation is in the docs/ folder
* `tests/query-builder-base.js`	contains a lot of usage examples
* The `tests/adapters` folder contains examples of how to set up a connection for the appropriate database library
* The documentation generated for the latest dev build is also [Available](https://github.timshomepage.net/node-query/docs/)

