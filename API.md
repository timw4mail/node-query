<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [NodeQuery](#nodequery)
    -   [getQuery](#getquery)
-   [QueryBuilder](#querybuilder)
    -   [queryFile](#queryfile)
    -   [query](#query)
    -   [resetQuery](#resetquery)
    -   [truncate](#truncate)
    -   [end](#end)
    -   [select](#select)
    -   [from](#from)
    -   [like](#like)
    -   [notLike](#notlike)
    -   [orLike](#orlike)
    -   [orNotLike](#ornotlike)
    -   [having](#having)
    -   [orHaving](#orhaving)
    -   [where](#where)
    -   [orWhere](#orwhere)
    -   [whereIsNull](#whereisnull)
    -   [whereIsNotNull](#whereisnotnull)
    -   [orWhereIsNull](#orwhereisnull)
    -   [orWhereIsNotNull](#orwhereisnotnull)
    -   [whereIn](#wherein)
    -   [orWhereIn](#orwherein)
    -   [whereNotIn](#wherenotin)
    -   [orWhereNotIn](#orwherenotin)
    -   [set](#set)
    -   [join](#join)
    -   [groupBy](#groupby)
    -   [orderBy](#orderby)
    -   [limit](#limit)
    -   [groupStart](#groupstart)
    -   [orGroupStart](#orgroupstart)
    -   [orNotGroupStart](#ornotgroupstart)
    -   [groupEnd](#groupend)
    -   [get](#get)
    -   [insert](#insert)
    -   [insertBatch](#insertbatch)
    -   [update](#update)
    -   [updateBatch](#updatebatch)
    -   [delete](#delete)
    -   [getCompiledSelect](#getcompiledselect)
    -   [getCompiledInsert](#getcompiledinsert)
    -   [getCompiledUpdate](#getcompiledupdate)
    -   [getCompiledDelete](#getcompileddelete)
-   [Result](#result)
    -   [rowCount](#rowcount)
    -   [columnCount](#columncount)

## NodeQuery

Class for connection management

**Parameters**

-   `config` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** connection parameters

### getQuery

Return an existing query builder instance

Returns **[QueryBuilder](#querybuilder)** The Query Builder object

## QueryBuilder

**Extends QueryBuilderBase**

Main object that builds SQL queries.

**Parameters**

-   `Driver` **Driver** The syntax driver for the database
-   `Adapter` **Adapter** The database module adapter for running queries

### queryFile

Run a set of queries from a file

**Parameters**

-   `file` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The path to the sql file
-   `separator` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The character separating each query (optional, default `';'`)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** The result of all the queries

### query

Run an arbitrary sql query. Run as a prepared statement.

**Parameters**

-   `sql` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The sql to execute
-   `params` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)?** The query parameters

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Promise with result of query

### resetQuery

Reset the object state for a new query

Returns **void** 

### truncate

Empties the selected database table

**Parameters**

-   `table` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the name of the table to truncate

Returns **(void | [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise))** Returns a promise if no callback is supplied

### end

Closes the database connection for the current adapter

Returns **void** 

### select

Specify rows to select in the query

**Parameters**

-   `fields` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array))** The fields to select from the current table

**Examples**

```javascript
query.select('foo, bar'); // Select multiple fields with a string
```

```javascript
query.select(['foo', 'bar']); // Select multiple fileds with an array
```

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### from

Specify the database table to select from

**Parameters**

-   `tableName` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The table to use for the current query

**Examples**

```javascript
query.from('tableName');
```

```javascript
query.from('tableName t'); // Select the table with an alias
```

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### like

Add a 'like/ and like' clause to the query

**Parameters**

-   `field` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the field  to compare to
-   `val` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The value to compare to
-   `pos` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The placement of the wildcard character(s): before, after, or both (optional, default `both`)

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### notLike

Add a 'not like/ and not like' clause to the query

**Parameters**

-   `field` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the field  to compare to
-   `val` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The value to compare to
-   `pos` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The placement of the wildcard character(s): before, after, or both (optional, default `both`)

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### orLike

Add an 'or like' clause to the query

**Parameters**

-   `field` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the field  to compare to
-   `val` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The value to compare to
-   `pos` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The placement of the wildcard character(s): before, after, or both (optional, default `both`)

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### orNotLike

Add an 'or not like' clause to the query

**Parameters**

-   `field` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the field  to compare to
-   `val` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The value to compare to
-   `pos` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The placement of the wildcard character(s): before, after, or both (optional, default `both`)

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### having

Add a 'having' clause

**Parameters**

-   `key` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object))** The name of the field and the comparision operator, or an object
-   `val` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))?** The value to compare if the value of key is a string (optional, default `null`)

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### orHaving

Add an 'or having' clause

**Parameters**

-   `key` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object))** The name of the field and the comparision operator, or an object
-   `val` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))?** The value to compare if the value of key is a string (optional, default `null`)

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### where

Set a 'where' clause

**Parameters**

-   `key` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object))** The name of the field and the comparision operator, or an object
-   `val` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))?** The value to compare if the value of key is a string

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### orWhere

Set a 'or where' clause

**Parameters**

-   `key` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object))** The name of the field and the comparision operator, or an object
-   `val` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))?** The value to compare if the value of key is a string

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### whereIsNull

Select a field that is Null

**Parameters**

-   `field` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the field that has a NULL value

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### whereIsNotNull

Specify that a field IS NOT NULL

**Parameters**

-   `field` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name so the field that is not to be null

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### orWhereIsNull

Field is null prefixed with 'OR'

**Parameters**

-   `field` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the field

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### orWhereIsNotNull

Field is not null prefixed with 'OR'

**Parameters**

-   `field` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the field

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### whereIn

Set a 'where in' clause

**Parameters**

-   `key` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the field to search
-   `values` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** the array of items to search in

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### orWhereIn

Set a 'or where in' clause

**Parameters**

-   `key` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the field to search
-   `values` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** the array of items to search in

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### whereNotIn

Set a 'where not in' clause

**Parameters**

-   `key` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the field to search
-   `values` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** the array of items to search in

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### orWhereNotIn

Set a 'or where not in' clause

**Parameters**

-   `key` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the field to search
-   `values` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** the array of items to search in

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### set

Set values for insertion or updating

**Parameters**

-   `key` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object))** The key or object to use
-   `val` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The value if using a scalar key

**Examples**

```javascript
query.set('foo', 'bar'); // Set a key, value pair
```

```javascript
query.set({foo:'bar'}); // Set with an object
```

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### join

Add a join clause to the query

**Parameters**

-   `table` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The table you are joining
-   `cond` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The join condition.
-   `type` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The type of join, which defaults to inner (optional, default `'inner'`)

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### groupBy

Group the results by the selected field(s)

**Parameters**

-   `field` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array))** The name of the field to group by

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### orderBy

Order the results by the selected field(s)

**Parameters**

-   `field` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The field(s) to order by
-   `type` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The order direction, ASC or DESC (optional, default `'ASC'`)

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### limit

Put a limit on the query

**Parameters**

-   `limit` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The maximum number of rows to fetch
-   `offset` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** The row number to start from

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### groupStart

Adds an open paren to the current query for logical grouping

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### orGroupStart

Adds an open paren to the current query for logical grouping,
prefixed with 'OR'

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### orNotGroupStart

Adds an open paren to the current query for logical grouping,
prefixed with 'OR NOT'

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### groupEnd

Ends a logical grouping started with one of the groupStart methods

Returns **[QueryBuilder](#querybuilder)** The Query Builder object, for chaining

### get

Get the results of the compiled query

**Parameters**

-   `table` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The table to select from
-   `limit` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** A limit for the query
-   `offset` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** An offset for the query

**Examples**

```javascript
query.get('table_name').then(promiseCallback); // Get all the rows in the table
```

```javascript
query.get('table_name', 5); // Get 5 rows from the table
```

```javascript
query.get(); // Get the results of a query generated with other methods
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Result](#result)>** Promise containing the result of the query

### insert

Run the generated insert query

**Parameters**

-   `table` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The table to insert into
-   `data` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Data to insert, if not already added with the 'set' method

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Result](#result)>** Promise containing the result of the query

### insertBatch

Insert multiple sets of rows at a time

**Parameters**

-   `table` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The table to insert into
-   `data` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** The array of objects containing data rows to insert

**Examples**

```javascript
query.insertBatch('foo',[{id:1,val:'bar'},{id:2,val:'baz'}])
.then(promiseCallback);
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Result](#result)>** Promise containing the result of the query

### update

Run the generated update query

**Parameters**

-   `table` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The table to insert into
-   `data` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Data to insert, if not already added with the 'set' method

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Result](#result)>** Promise containing the result of the query

### updateBatch

Creates a batch update sql statement

**Parameters**

-   `table` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The table to update
-   `data` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Batch insert data
-   `updateKey` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The field in the table to compare against for updating

Returns **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Number of rows updated

### delete

Run the generated delete query

**Parameters**

-   `table` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The table to insert into
-   `where` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Where clause for delete statement

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Result](#result)>** Promise containing the result of the query

### getCompiledSelect

Return generated select query SQL

**Parameters**

-   `table` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** the name of the table to retrieve from
-   `reset` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Whether to reset the query builder so another query can be built (optional, default `true`)

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The compiled sql statement

### getCompiledInsert

Return generated insert query SQL

**Parameters**

-   `table` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the name of the table to insert into
-   `reset` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Whether to reset the query builder so another query can be built (optional, default `true`)

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The compiled sql statement

### getCompiledUpdate

Return generated update query SQL

**Parameters**

-   `table` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the name of the table to update
-   `reset` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Whether to reset the query builder so another query can be built (optional, default `true`)

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The compiled sql statement

### getCompiledDelete

Return generated delete query SQL

**Parameters**

-   `table` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the name of the table to delete from
-   `reset` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Whether to reset the query builder so another query can be built (optional, default `true`)

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The compiled sql statement

## Result

Query result object

**Parameters**

-   `rows` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** the data rows of the result (optional, default `[]`)
-   `columns` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** the column names in the result (optional, default `[]`)

### rowCount

Get the number of rows returned by the query

Returns **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** the number of rows in the result

### columnCount

Get the number of columns returned by the query

Returns **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** the number of columns in the result
