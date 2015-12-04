'use strict';

/** @module State */
module.exports = class State {
	constructor() {
		// Arrays/maps
		this.queryMap = [];
		this.values = [];
		this.whereValues = [];
		this.setArrayKeys = [];
		this.orderArray = [];
		this.groupArray = [];
		this.havingMap = [];
		this.whereMap = [];
		this.rawWhereValues = [];

		// Partials
		this.selectString = '';
		this.fromString = '';
		this.setString = '';
		this.orderString = '';
		this.groupString = '';

		// Other various values
		this.limit = null;
		this.offset = null;
	}
}
// End of module State