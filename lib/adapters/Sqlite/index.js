'use strict';

module.exports = config => {
	const Implementation = (config.adapter && config.adapter === 'dblite')
		? require('./dblite')
		: require('./sqlite3');

	return new Implementation(config.connection);
};

