'use strict';

const Pg = require('./Pg');
const PgNative = require('./PgNative')

module.exports = config => {
	return (config.native)
		? new PgNative(config.connection)
		: new Pg(config.connection);
};
