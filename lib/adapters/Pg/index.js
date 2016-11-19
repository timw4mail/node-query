'use strict';

const Pg = require('./pg');

module.exports = config => {
	return new Pg(config.connection);
};
