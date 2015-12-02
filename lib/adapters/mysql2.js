'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _Adapter2 = require('../Adapter');

var _Adapter3 = _interopRequireDefault(_Adapter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @module adapters/mysql2 */
module.exports = (function (_Adapter) {
	_inherits(mysql2, _Adapter);

	function mysql2() {
		_classCallCheck(this, mysql2);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(mysql2).apply(this, arguments));
	}

	_createClass(mysql2, [{
		key: 'execute',

		/**
   * Run the sql query as a prepared statement
   *
   * @param {String} sql - The sql with placeholders
   * @param {Array} params - The values to insert into the query
   * @param {Function} callback - Callback to run when a response is recieved
   * @return void
   */
		value: function execute(sql, params, callback) {
			this.instance.execute.apply(this.instance, arguments);
		}
	}]);

	return mysql2;
})(_Adapter3.default);
//# sourceMappingURL=mysql2.js.map
