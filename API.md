# NodeQuery

Class for connection management

## getQuery

Return an existing query builder instance

Returns **QueryBuilder** The Query Builder object

## init

Create a query builder object

**Parameters**

-   `driverType` **String** The name of the database type, eg. mysql or pg
-   `connObject` **Object** A connection object from the database library you are connecting with
-   `connLib` **[String]** The name of the db connection library you are using, eg. mysql or mysql2. Optional if the same as driverType

Returns **QueryBuilder** The Query Builder object

# QueryBuilder

Main object that builds SQL queries.

**Parameters**

-   `Driver` **Driver** The syntax driver for the database
-   `Adapter` **Adapter** The database module adapter for running queries

## delete

Run the generated delete query

**Parameters**

-   `table` **String** The table to insert into
-   `where` **[Object]** Where clause for delete statement
-   `callback` **[Function]** Callback for handling response from the database

Returns **void or Promise** If no callback is passed, a promise is returned

## end

Closes the database connection for the current adapter

Returns **void** 

## from

Specify the database table to select from

**Parameters**

-   `tableName` **String** The table to use for the current query

**Examples**

```javascript
query.from('tableName');
```

```javascript
query.from('tableName t'); // Select the table with an alias
```

Returns **QueryBuilder** The Query Builder object, for chaining

## get

Get the results of the compiled query

**Parameters**

-   `table` **[String]** The table to select from
-   `limit` **[Number]** A limit for the query
-   `offset` **[Number]** An offset for the query
-   `callback` **[Function]** A callback for receiving the result

**Examples**

```javascript
query.get('table_name').then(promiseCallback); // Get all the rows in the table
```

```javascript
query.get('table_name', 5, callback); // Get 5 rows from the table
```

```javascript
query.get(callback); // Get the results of a query generated with other methods
```

Returns **void or Promise** If no callback is passed, a promise is returned

## getCompiledDelete

Return generated delete query SQL

**Parameters**

-   `table` **String** the name of the table to delete from
-   `reset` **[Boolean]** Whether to reset the query builder so another query can be built (optional, default `true`)

Returns **String** The compiled sql statement

## getCompiledInsert

Return generated insert query SQL

**Parameters**

-   `table` **String** the name of the table to insert into
-   `reset` **[Boolean]** Whether to reset the query builder so another query can be built (optional, default `true`)

Returns **String** The compiled sql statement

## getCompiledSelect

Return generated select query SQL

**Parameters**

-   `table` **[String]** the name of the table to retrieve from
-   `reset` **[Boolean]** Whether to reset the query builder so another query can be built (optional, default `true`)

Returns **String** The compiled sql statement

## getCompiledUpdate

Return generated update query SQL

**Parameters**

-   `table` **String** the name of the table to update
-   `reset` **[Boolean]** Whether to reset the query builder so another query can be built (optional, default `true`)

Returns **String** The compiled sql statement

## groupBy

Group the results by the selected field(s)

**Parameters**

-   `field` **String or Array** The name of the field to group by

Returns **QueryBuilder** The Query Builder object, for chaining

## groupEnd

Ends a logical grouping started with one of the groupStart methods

Returns **QueryBuilder** The Query Builder object, for chaining

## groupStart

Adds an open paren to the current query for logical grouping

Returns **QueryBuilder** The Query Builder object, for chaining

## having

Add a 'having' clause

**Parameters**

-   `key` **String or Object** The name of the field and the comparision operator, or an object
-   `val` **[String or Number]** The value to compare if the value of key is a string

Returns **QueryBuilder** The Query Builder object, for chaining

## insert

Run the generated insert query

**Parameters**

-   `table` **String** The table to insert into
-   `data` **[Object]** Data to insert, if not already added with the 'set' method
-   `callback` **[Function]** Callback for handling response from the database

Returns **void or Promise** If no callback is passed, a promise is returned

## insertBatch

Insert multiple sets of rows at a time

**Parameters**

-   `table` **String** The table to insert into
-   `data` **Array** The array of objects containing data rows to insert
-   `callback` **[Function]** Callback for handling database response

**Examples**

```javascript
query.insertBatch('foo',[{id:1,val:'bar'},{id:2,val:'baz'}], callbackFunction);
```

```javascript
query.insertBatch('foo',[{id:1,val:'bar'},{id:2,val:'baz'}])
.then(promiseCallback);
```

Returns **void or Promise** If no callback is passed, a promise is returned

## join

Add a join clause to the query

**Parameters**

-   `table` **String** The table you are joining
-   `cond` **String** The join condition.
-   `type` **[String]** The type of join, which defaults to inner (optional, default `'inner'`)

Returns **QueryBuilder** The Query Builder object, for chaining

## like

Add a 'like/ and like' clause to the query

**Parameters**

-   `field` **String** The name of the field  to compare to
-   `val` **String** The value to compare to
-   `pos` **[String]** The placement of the wildcard character(s): before, after, or both (optional, default `both`)

Returns **QueryBuilder** The Query Builder object, for chaining

## limit

Put a limit on the query

**Parameters**

-   `limit` **Number** The maximum number of rows to fetch
-   `offset` **[Number]** The row number to start from

Returns **QueryBuilder** The Query Builder object, for chaining

## notLike

Add a 'not like/ and not like' clause to the query

**Parameters**

-   `field` **String** The name of the field  to compare to
-   `val` **String** The value to compare to
-   `pos` **[String]** The placement of the wildcard character(s): before, after, or both (optional, default `both`)

Returns **QueryBuilder** The Query Builder object, for chaining

## orGroupStart

Adds an open paren to the current query for logical grouping,
prefixed with 'OR'

Returns **QueryBuilder** The Query Builder object, for chaining

## orHaving

Add an 'or having' clause

**Parameters**

-   `key` **String or Object** The name of the field and the comparision operator, or an object
-   `val` **[String or Number]** The value to compare if the value of key is a string

Returns **QueryBuilder** The Query Builder object, for chaining

## orLike

Add an 'or like' clause to the query

**Parameters**

-   `field` **String** The name of the field  to compare to
-   `val` **String** The value to compare to
-   `pos` **[String]** The placement of the wildcard character(s): before, after, or both (optional, default `both`)

Returns **QueryBuilder** The Query Builder object, for chaining

## orNotGroupStart

Adds an open paren to the current query for logical grouping,
prefixed with 'OR NOT'

Returns **QueryBuilder** The Query Builder object, for chaining

## orNotLike

Add an 'or not like' clause to the query

**Parameters**

-   `field` **String** The name of the field  to compare to
-   `val` **String** The value to compare to
-   `pos` **[String]** The placement of the wildcard character(s): before, after, or both (optional, default `both`)

Returns **QueryBuilder** The Query Builder object, for chaining

## orWhere

Set a 'or where' clause

**Parameters**

-   `key` **String or Object** The name of the field and the comparision operator, or an object
-   `val` **[String or Number]** The value to compare if the value of key is a string

Returns **QueryBuilder** The Query Builder object, for chaining

## orWhereIn

Set a 'or where in' clause

**Parameters**

-   `key` **String** the field to search
-   `values` **Array** the array of items to search in

Returns **QueryBuilder** The Query Builder object, for chaining

## orWhereIsNotNull

Field is not null prefixed with 'OR'

**Parameters**

-   `field` **String** The name of the field

Returns **QueryBuilder** The Query Builder object, for chaining

## orWhereIsNull

Field is null prefixed with 'OR'

**Parameters**

-   `field` **String** The name of the field

Returns **QueryBuilder** The Query Builder object, for chaining

## orWhereNotIn

Set a 'or where not in' clause

**Parameters**

-   `key` **String** the field to search
-   `values` **Array** the array of items to search in

Returns **QueryBuilder** The Query Builder object, for chaining

## orderBy

Order the results by the selected field(s)

**Parameters**

-   `field` **String** The field(s) to order by
-   `type` **[String]** The order direction, ASC or DESC (optional, default `'ASC'`)

Returns **QueryBuilder** The Query Builder object, for chaining

## query

Manually make an sql query
Returns a promise if no callback is provided

**Parameters**

-   `sql` **string** The sql to execute
-   `params` **[array]** The query parameters
-   `callback` **[function]** Optional callback

Returns **void or Promise** Returns a promise if no callback is supplied

## resetQuery

Reset the object state for a new query

Returns **void** 

## select

Specify rows to select in the query

**Parameters**

-   `fields` **String or Array** The fields to select from the current table

**Examples**

```javascript
query.select('foo, bar'); // Select multiple fields with a string
```

```javascript
query.select(['foo', 'bar']); // Select multiple fileds with an array
```

Returns **QueryBuilder** The Query Builder object, for chaining

## set

Set values for insertion or updating

**Parameters**

-   `key` **String or Object** The key or object to use
-   `val` **[String]** The value if using a scalar key

**Examples**

```javascript
query.set('foo', 'bar'); // Set a key, value pair
```

```javascript
query.set({foo:'bar'}); // Set with an object
```

Returns **QueryBuilder** The Query Builder object, for chaining

## update

Run the generated update query

**Parameters**

-   `table` **String** The table to insert into
-   `data` **[Object]** Data to insert, if not already added with the 'set' method
-   `callback` **[Function]** Callback for handling response from the database

Returns **void or Promise** If no callback is passed, a promise is returned

## where

Set a 'where' clause

**Parameters**

-   `key` **String or Object** The name of the field and the comparision operator, or an object
-   `val` **[String or Number]** The value to compare if the value of key is a string

Returns **QueryBuilder** The Query Builder object, for chaining

## whereIn

Set a 'where in' clause

**Parameters**

-   `key` **String** the field to search
-   `values` **Array** the array of items to search in

Returns **QueryBuilder** The Query Builder object, for chaining

## whereIsNotNull

Specify that a field IS NOT NULL

**Parameters**

-   `field` **String** The name so the field that is not to be null

Returns **QueryBuilder** The Query Builder object, for chaining

## whereIsNull

Select a field that is Null

**Parameters**

-   `field` **String** The name of the field that has a NULL value

Returns **QueryBuilder** The Query Builder object, for chaining

## whereNotIn

Set a 'where not in' clause

**Parameters**

-   `key` **String** the field to search
-   `values` **Array** the array of items to search in

Returns **QueryBuilder** The Query Builder object, for chaining

# promisify

Function to convert a callback function into a promise

**Parameters**

-   `fn` **Function** the callback function to convert

**Examples**

```javascript
promisify(fs.readFile)('hello.txt', 'utf8')
.then(console.log)
.catch(console.error)
```

Returns **Promise** the new promise
