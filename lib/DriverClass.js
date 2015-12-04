'use strict';

let driverBase = require('./DriverBase'),
	getArgs = require('getargs');

module.exports = class DriverClass {
	constructor(/* properties:object */) {
		let args = getArgs('[properties]:object', arguments);

		args.properties = args.properties || {};

		Object.keys(driverBase).forEach(key => {
			this[key] = (Object.keys(args.properties).indexOf(key) !== -1)
				? args.properties[key]
				: driverBase[key];
		});
	}
}