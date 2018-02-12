module.exports = config => {
	const Implementation = (config.native)
		? require('./sqlite3')
		: require('./dblite');

	return new Implementation(config.connection);
};
