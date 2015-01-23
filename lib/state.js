'use strict';

/** @module State */
module.exports = function State() {
	return {
		// Arrays/Maps
		queryMap: [],
		values: [],
		whereValues: [],
		setArrayKeys: [],
		orderArray: [],
		groupArray: [],
		havingMap: [],
		whereMap: {},
		rawWhereValues: [],

		// Partials
		selectString: '',
		fromString: '',
		setString: '',
		orderString: '',
		groupString: '',

		// Other various values
		limit: null,
		offset: null
	};
};
// End of module State