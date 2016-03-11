# Changelog

## 4.0.0
* Changed connection setup to just use a config object - the appropriate adapter object is created by the library.
* Removed mysql adapter, as mysql2 is very similar and does proper prepared statements

## 3.2.0
* Added public `query` method for making arbitrary sql calls
* Added back tests for `node-firebird` adapter. Using this adapter with promises is not currently supported.

## 3.1.0
* Added support for promises on query execution methods