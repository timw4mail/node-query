'use strict';

const Pg = require('./Pg');

module.exports = config => {
	return new Pg(config.connection);
};
