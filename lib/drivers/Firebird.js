"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _helpers = require('../helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _DriverClass = require('../DriverClass');

var _DriverClass2 = _interopRequireDefault(_DriverClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Driver for Firebird databases
 *
 * @module drivers/firebird
 */

var Firebird = (function (_Driver) {
	_inherits(Firebird, _Driver);

	function Firebird() {
		_classCallCheck(this, Firebird);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(Firebird).call(this, {
			hasTruncate: false
		}));
	}

	/**
  * Generate a limit clause for firebird, which uses the syntax closest to the SQL standard
  *
  * @param {String} sql
  * @param {Number} limit
  * @param {Number} offset
  * @return {String}
  */

	_createClass(Firebird, [{
		key: 'limit',
		value: function limit(origSql, _limit, offset) {
			var sql = 'FIRST  ' + _limit;

			if (_helpers2.default.isNumber(offset)) {
				sql += ' SKIP  ' + offset;
			}

			return origSql.replace(/SELECT/i, "SELECT " + sql);
		}

		/**
   * SQL to insert a group of rows
   *
   * @param {String} table - The table to insert to
   * @param {Array} [data] - The array of object containing data to insert
   * @return {String}
   */

	}, {
		key: 'insertBatch',
		value: function insertBatch() {
			throw new Error("Not Implemented");
		}
	}]);

	return Firebird;
})(_DriverClass2.default);

module.exports = new Firebird();
//# sourceMappingURL=Firebird.js.map
