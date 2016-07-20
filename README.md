# CI-Node-query

A node query builder for various SQL databases, based on [CodeIgniter](http://www.codeigniter.com/user_guide/database/query_builder.html)'s query builder.

[![Build Status](https://jenkins.timshomepage.net/buildStatus/icon?job=node-query)](https://jenkins.timshomepage.net/job/node-query/)

### Features
* Callback and Promise API for making database calls.

### Supported databases

* Mysql (via `mysql2`)
* PostgreSQL (via `pg`)
* Sqlite (via `dblite`)

### Installation

	npm install ci-node-query

[![NPM](https://nodei.co/npm/ci-node-query.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ci-node-query/)

(Versions 3.x and below work differently. Their documentation is [here](https://git.timshomepage.net/timw4mail/node-query/tree/v3#README))

### Basic use
```javascript

// Set the database connection details
const nodeQuery = require('ci-node-query')({
"driver": "mysql",
	"connection": {
		"host": "localhost",
		"user": "test",
		"password": "",
		"database": "test"
	}
});

// Get the query builder
const query = nodeQuery.getQuery();

query.select('foo')
	.from('bar')
	.where('x', 3)
	.orWhere({y: 2})
	.join('baz', 'baz.boo = bar.foo', 'left')
	.orderBy('x', 'DESC')
	.limit(2, 3)
	.get(function(err, result) {
		// Handle Results Here
	});

// As of version 3.1.0, you can also get promises
const queryPromise = query.select('foo')
	.from('bar')
	.where('x', 3)
	.orWhere({y: 2})
	.join('baz', 'baz.boo = bar.foo', 'left')
	.orderBy('x', 'DESC')
	.limit(2, 3)
	.get();

queryPromise.then(function(res) {
	// Handle query results
});
```

### Result object
As of version 4, all adapters return a standard result object, which looks similar to this:

```javascript
// Result object
{
    rows: [{
        columnName1: value1,
        columnName2: value2,
    }],

    columns: ['column1', 'column2'],
}
```

In addition to the rows, and columns properties,
the result object has two methods, `rowCount` and `columnCount`.
These methods return the number of rows and columns columns in the current result.


### Security notes
As of version 2, `where` and `having` type methods parse the values passed to look for function calls. While values passed are still passed as query parameters, take care to avoid passing these kinds of methods unfiltered input. SQL function arguments are not currently parsed, so they need to be properly escaped for the current database.


### Additional help

* Generated documentation is in the docs/ folder
* The API is documented in [API.md](./API.md)
* The `tests/adapters` folder contains examples of how to set up a connection for the appropriate database library
* The documentation generated for the latest dev build is also [Available](https://github.timshomepage.net/node-query/docs/index.html)

