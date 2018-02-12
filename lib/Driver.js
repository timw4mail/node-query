const Helpers = require('./Helpers');

/**
 * Base Database Driver
 *
 * @private
 */
const Driver = {
	identifierStartChar: '"',
	identifierEndChar: '"',
	tablePrefix: null,
	hasTruncate: true,

	/**
	 * Low level function for naive quoting of strings
	 *
	 * @param {String} str - The sql fragment to quote
	 * @return {String} - The quoted sql fragment
	 * @private
	 */
	_quote (str) {
		return (Helpers.isString(str) &&
			!(str.startsWith(Driver.identifierStartChar) || str.endsWith(Driver.identifierEndChar))
		)
			? `${Driver.identifierStartChar}${str}${Driver.identifierEndChar}`
			: str;
	},

	/**
	 * Set the limit clause
	 * @private
	 * @param {String} sql - SQL statement to modify
	 * @param {Number} limit - Maximum number of rows to fetch
	 * @param {Number} [offset] - Number of rows to skip
	 * @return {String} - Modified SQL statement
	 */
	limit (sql, limit, offset) {
		sql += ` LIMIT ${limit}`;

		if (Helpers.isNumber(offset)) {
			sql += ` OFFSET ${offset}`;
		}

		return sql;
	},

	/**
	 * Quote database table name, and set prefix
	 *
	 * @private
	 * @param {String} table - Table name to quote
	 * @return {String} - Quoted table name
	 */
	quoteTable (table) {
		// Quote after prefix
		return Driver.quoteIdentifiers(table);
	},

	/**
	 * Use the driver's escape character to quote identifiers
	 *
	 * @private
	 * @param {String|Array} str - String or array of strings to quote identifiers
	 * @return {String|Array} - Quoted identifier(s)
	 */
	quoteIdentifiers (str) {
		const pattern = new RegExp(
			`${Driver.identifierStartChar}(` +
				'([a-zA-Z0-9_]+)' + '(((.*?)))' +
				`)${Driver.identifierEndChar}`, 'ig');

		// Recurse for arrays of identifiers
		if (Array.isArray(str)) {
			return str.map(Driver.quoteIdentifiers);
		}

		// cast to string so that you don't have undefined method errors with junk data
		str = String(str);

		// Handle commas
		if (str.includes(',')) {
			const parts = str.split(',').map(Helpers.stringTrim);
			str = parts.map(Driver.quoteIdentifiers).join(',');
		}

		// Split identifiers by period
		const hierarchies = str.split('.').map(Driver._quote);
		let raw = hierarchies.join('.');

		// Fix functions
		if (raw.includes('(') && raw.includes(')')) {
			const functionCalls = pattern.exec(raw);

			// Unquote the function
			raw = raw.replace(functionCalls[0], functionCalls[1]);

			// Quote the identifiers inside of the parens
			const inParens = functionCalls[3].substring(1, functionCalls[3].length - 1);
			raw = raw.replace(inParens, Driver.quoteIdentifiers(inParens));
		}

		return raw;
	},

	/**
	 * Generate SQL to truncate the passed table
	 *
	 * @private
	 * @param {String} table - Table to truncate
	 * @return {String} - Truncation SQL
	 */
	truncate (table) {
		let sql = (Driver.hasTruncate)
			? 'TRUNCATE '
			: 'DELETE FROM ';

		sql += Driver.quoteTable(table);

		return sql;
	},

	/**
	 * Generate SQL to insert a group of rows
	 *
	 * @private
	 * @param {String} table - The table to insert to
	 * @param {Array} [data] - The array of object containing data to insert
	 * @return {String} - Query and data to insert
	 */
	insertBatch (table, data) {
		const values = [];
		const fields = Object.keys(data[0]);
		let sql = '';

		// Get the data values to insert, so they can
		// be parameterized
		data.forEach(obj => {
			Object.keys(obj).forEach(key => {
				values.push(obj[key]);
			});
		});

		// Get the field names from the keys of the first
		// object inserted
		table = Driver.quoteTable(table);

		sql += `INSERT INTO ${table} (${Driver.quoteIdentifiers(fields).join(',')}) VALUES `;

		// Create placeholder groups
		const params = Array(fields.length).fill('?');
		const paramString = `(${params.join(',')})`;
		const paramList = Array(data.length).fill(paramString);

		sql += paramList.join(',');

		return {
			sql: sql,
			values: values
		};
	},

	/**
	 * Creates a batch update sql statement
	 *
	 * @private
	 * @param {String} table - The name of the table to update
	 * @param {Array<Object>} data -  Array of objects containing the update data
	 * @param {String} updateKey - the field name to update based on
	 * @return {Array<String,Object,Number>} - array of parameters passed to run the query
	 */
	updateBatch (table, data, updateKey) {
		let affectedRows = 0;
		let insertData = [];
		const fieldLines = [];

		let sql = `UPDATE ${Driver.quoteTable(table)} SET `;

		// get the keys of the current set of data, except the one used to
		// set the update condition
		const fields = data.reduce((previous, current) => {
			affectedRows++;
			const keys = Object.keys(current).filter(key => {
				return key !== updateKey && !previous.includes(key);
			});
			return previous.concat(keys);
		}, []);

		// Create the CASE blocks for each data set
		fields.forEach(field => {
			let line = `${Driver.quoteIdentifiers(field)} = CASE\n`;
			const cases = [];
			data.forEach(currentCase => {
				insertData.push(currentCase[updateKey]);
				insertData.push(currentCase[field]);

				const newCase = `WHEN ${Driver.quoteIdentifiers(updateKey)} =? THEN ? `;
				cases.push(newCase);
			});

			line += `${cases.join('\n')}\n`;
			line += `ELSE ${Driver.quoteIdentifiers(field)} END`;

			fieldLines.push(line);
		});

		sql += `${fieldLines.join(',\n')}\n`;

		const whereValues = [];
		data.forEach(entry => {
			const insertValue = entry[updateKey];
			whereValues.push(insertValue);
			insertData.push(insertValue);
		});

		// Create the placeholders for the WHERE IN clause
		const placeholders = Array(whereValues.length);
		placeholders.fill('?');

		sql += `WHERE ${Driver.quoteIdentifiers(updateKey)} IN `;
		sql += `( ${placeholders.join(',')} )`;

		return [sql, insertData, affectedRows];
	}
};

module.exports = Driver;
