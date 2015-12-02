'use strict';

var _DriverBase = require('./DriverBase');

var _DriverBase2 = _interopRequireDefault(_DriverBase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function DriverClass() {
	var _this = this;

	var properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	_classCallCheck(this, DriverClass);

	Object.keys(_DriverBase2.default).forEach(function (key) {
		_this[key] = Object.keys(properties).indexOf(key) !== -1 ? properties[key] : _DriverBase2.default[key];
	});
};
//# sourceMappingURL=DriverClass.js.map
