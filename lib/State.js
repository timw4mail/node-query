'use strict'

/** @module State */
;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function State() {
	_classCallCheck(this, State);

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
};
// End of module State
//# sourceMappingURL=State.js.map
