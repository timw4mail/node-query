'use strict';

import driverBase from './DriverBase';

module.exports = class DriverClass {
	constructor(properties = {}) {
		Object.keys(driverBase).forEach((key) => {
			this[key] = (Object.keys(properties).indexOf(key) !== -1)
				? properties[key]
				: driverBase[key];
		});
	}
}