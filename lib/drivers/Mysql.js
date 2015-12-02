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
 * Driver for MySQL databases
 *
 * @module drivers/mysql
 */

var Mysql = (function (_Driver) {
	_inherits(Mysql, _Driver);

	function Mysql() {
		_classCallCheck(this, Mysql);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(Mysql).call(this, {
			identifierStartChar: '`',
			identifierEndChar: '`'
		}));
	}

	_createClass(Mysql, [{
		key: 'limit',
		value: function limit(sql, _limit, offset) {
			if (!_helpers2.default.isNumber(offset)) {
				return sql += ' LIMIT ' + _limit;
			}

			return sql += ' LIMIT ' + offset + ', ' + _limit;
		}
	}]);

	return Mysql;
})(_DriverClass2.default);

module.exports = new Mysql();
//# sourceMappingURL=Mysql.js.map
