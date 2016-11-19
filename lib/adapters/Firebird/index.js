'use strict';

const NodeFirebird = require('./node-firebird');

module.exports = config => {
	return new NodeFirebird(config.connection);
};

