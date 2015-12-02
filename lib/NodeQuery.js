"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _QueryBuilder = require('./QueryBuilder');

var _QueryBuilder2 = _interopRequireDefault(_QueryBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instance = null;

/**
 * @module NodeQuery
 */

var NodeQuery = (function () {

	/**
  * Constructor
  */

	function NodeQuery() {
		_classCallCheck(this, NodeQuery);

		this.instance = null;
	}

	/**
  * Create a query builder object
  *
  * @memberOf NodeQuery
  * @param {String} drivername - The name of the database type, eg. mysql or pg
  * @param {Object} connObject - A connection object from the database library you are connecting with
  * @param {String} [connLib] - The name of the db connection library you are using, eg. mysql or mysql2. Optional if the same as drivername
  * @return {QueryBuilder}
  */

	_createClass(NodeQuery, [{
		key: 'init',
		value: function init(driverType, connObject, connLib) {
			connLib = connLib || driverType;

			var paths = {
				driver: __dirname + '/drivers/' + _helpers2.default.upperCaseFirst(driverType),
				adapter: __dirname + '/adapters/' + connLib
			};

			/*Object.keys(paths).forEach((type) => {
   	if ( ! fs.existsSync(paths[type]))
   	{
   		console.log(paths[type]);
   		throw new Error(
   			`Selected ${type} (` +
   			helpers.upperCaseFirst(driverType) +
   			`) does not exist!`
   		);
   	}
   });*/

			var driver = require(paths.driver);
			var $adapter = require(paths.adapter);
			var adapter = new $adapter(connObject);

			this.instance = new _QueryBuilder2.default(driver, adapter);

			return this.instance;
		}
	}, {
		key: 'getQuery',

		/**
   * Return an existing query builder instance
   *
   * @memberOf NodeQuery
   * @return {QueryBuilder}
   */
		value: function getQuery() {
			if (!this.instance) {
				throw new Error("No Query Builder instance to return");
			}

			return this.instance;
		}
	}]);

	return NodeQuery;
})();

;

module.exports = new NodeQuery();
//# sourceMappingURL=NodeQuery.js.map
