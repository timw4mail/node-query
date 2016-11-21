'use strict';

const Mysql2 = require('./mysql2');

module.exports = config => {
	return new Mysql2(config.connection);
};
