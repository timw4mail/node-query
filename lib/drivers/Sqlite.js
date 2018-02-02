/**
 * Driver for SQLite databases
 *
 * @module drivers/Sqlite
 */
module.exports = (() => {
	delete require.cache[require.resolve('../Driver')];
	let driver = require('../Driver');

	// Sqlite doesn't have a truncate command
	driver.hasTruncate = false;

	/**
	 * SQL to insert a group of rows
	 * Override default to have better compatibility
	 *
	 * @param {String} table - The table to insert to
	 * @param {Array} [data] - The array of object containing data to insert
	 * @return {String} - The generated sql statement
	 */
	driver.insertBatch = (table, data) => {
		// Get the data values to insert, so they can
		// be parameterized
		let sql = '';
		let first = data.shift();

		let vals = [];
		data.forEach(obj => {
			let row = [];
			Object.keys(obj).forEach(key => {
				row.push(obj[key]);
			});
			vals.push(row);
		});

		sql += `INSERT INTO ${driver.quoteTable(table)}\n`;

		// Get the field names from the keys of the first
		// object to be inserted
		let fields = Object.keys(first);
		let cols = [];
		fields.forEach(key => {
			cols.push(`'${driver._quote(first[key])}' AS ${driver.quoteIdentifiers(key)}`);
		});

		sql += `SELECT ${cols.join(', ')}\n`;

		vals.forEach(rowValues => {
			let quoted = rowValues.map(value => String(value).replace('\'', '\'\''));
			sql += `UNION ALL SELECT '${quoted.join('\', \'')}'\n`;
		});

		return {
			sql: sql,
			values: undefined
		};
	};

	return driver;
})();
