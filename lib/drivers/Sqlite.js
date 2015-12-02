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
 * Driver for Sqlite databases
 *
 * @module drivers/sqlite
 */

var Sqlite = (function (_Driver) {
	_inherits(Sqlite, _Driver);

	function Sqlite() {
		_classCallCheck(this, Sqlite);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Sqlite).call(this));

		_this.hasTruncate = false;
		return _this;
	}

	_createClass(Sqlite, [{
		key: 'insertBatch',
		value: function insertBatch(table, data) {
			var _this2 = this;

			// Get the data values to insert, so they can
			// be parameterized
			var sql = "",
			    vals = [],
			    cols = [],
			    fields = [],
			    first = data.shift(),
			    params = [],
			    paramString = "",
			    paramList = [];

			data.forEach(function (obj) {
				var row = [];
				Object.keys(obj).forEach(function (key) {
					row.push(obj[key]);
				});
				vals.push(row);
			});

			sql += "INSERT INTO " + this.quoteTable(table) + "\n";

			// Get the field names from the keys of the first
			// object to be inserted
			fields = Object.keys(first);
			Object.keys(first).forEach(function (key) {
				cols.push("'" + _this2._quote(first[key]) + "' AS " + _this2.quoteIdentifiers(key));
			});

			sql += "SELECT " + cols.join(', ') + "\n";

			vals.forEach(function (row_values) {
				var quoted = row_values.map(function (value) {
					return String(value).replace("'", "'\'");
				});
				sql += "UNION ALL SELECT '" + quoted.join("', '") + "'\n";
			});

			return {
				sql: sql,
				values: null
			};
		}
	}]);

	return Sqlite;
})(_DriverClass2.default);

;

module.exports = new Sqlite();
//# sourceMappingURL=Sqlite.js.map
