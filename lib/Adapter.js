'use strict'

/** @module Adapter */
;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = (function () {
	/**
  * Invoke an adapter
  *
  * @param  {Object} instance - The connection objec
  * @return {void}
  */

	function Adapter(instance) {
		_classCallCheck(this, Adapter);

		this.instance = instance;
	}

	/**
  * Run the sql query as a prepared statement
  *
  * @param {String} sql - The sql with placeholders
  * @param {Array} params - The values to insert into the query
  * @param {Function} callback - Callback to run when a response is recieved
  * @return {void}
  */

	_createClass(Adapter, [{
		key: "execute",
		value: function execute() /*sql, params, callback*/{
			throw new Error("Correct adapter not defined for query execution");
		}
	}]);

	return Adapter;
})();
//# sourceMappingURL=Adapter.js.map
