"use strict";

/** @module node-query */
var nodeQuery = {};

/**
 * Create a query builder object
 *
 * @alias module:node-query
 * @param {String} drivername - The name of the database type, eg. mysql or pg
 * @param {Object} connObject - A connection object from the database library you are connecting with
 * @param {String} connLib - The name of the db connection library you are using, eg. mysql or mysql2
 * @return {queryBuilder}
 */
nodeQuery.init = function (driverType, connObject, connLib) {
	var fs = require('fs'),
		qb = require('./query-builder');

	var paths = {
		driver: __dirname + '/drivers/' + driverType + '.js',
		adapter: __dirname + '/adapters/' + connLib + '.js'
	};

	Object.keys(paths).forEach(function(type) {
		if ( ! fs.existsSync(paths[type]))
		{
			console.log(paths[type]);
			throw new Error('Selected ' + type + ' does not exist!');
		}
	});

	return new qb(require(paths.driver), require(paths.adapter)(connObject));
};


module.exports = nodeQuery.init;