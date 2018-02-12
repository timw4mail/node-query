/**
 * Driver for PostgreSQL databases
 *
 * @module drivers/Pg
 */
module.exports = (() => {
	delete require.cache[require.resolve('../Driver')];
	return require('../Driver');
})();
