'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.onigasmPromise = exports.OnigasmLib = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.fetchOnigasm = fetchOnigasm;

var _onigasm = require('onigasm');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function fetchOnigasm() {
    return new Promise(function (resolve, reject) {
        var onigasmPath = require('onigasm/lib/onigasm.wasm');
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    reject(new Error('Could not fetch onigasm'));
                }
            }
        };
        request.open('GET', onigasmPath, true);
        request.responseType = 'arraybuffer';
        request.send();
    });
}

var OnigasmLib = exports.OnigasmLib = function () {
    function OnigasmLib() {
        _classCallCheck(this, OnigasmLib);
    }

    _createClass(OnigasmLib, [{
        key: 'createOnigScanner',
        value: function createOnigScanner(sources) {
            return new _onigasm.OnigScanner(sources);
        }
    }, {
        key: 'createOnigString',
        value: function createOnigString(sources) {
            return new _onigasm.OnigString(sources);
        }
    }]);

    return OnigasmLib;
}();

var onigasmPromise = exports.onigasmPromise = fetchOnigasm().then(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(buffer) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        console.log("DONE BROS!");
                        _context.next = 3;
                        return (0, _onigasm.loadWASM)(buffer);

                    case 3:
                        return _context.abrupt('return', new OnigasmLib());

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x) {
        return _ref.apply(this, arguments);
    };
}());