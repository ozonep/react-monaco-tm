'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Resolver = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vscodeTextmate = require('vscode-textmate');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("fs");

var Resolver = exports.Resolver = function () {
    function Resolver(languages, onigLibPromise, onigLibName) {
        var _this = this;

        _classCallCheck(this, Resolver);

        this.langMap = {};
        this.scopeToLangMap = {};
        this._languages = languages;
        this._onigLibPromise = onigLibPromise;
        this._onigLibName = onigLibName;
        this._languages.forEach(function (l) {
            _this.langMap[l.id] = l;
            l.aliases.forEach(function (a) {
                _this.langMap[a] = l;
            });
            _this.scopeToLangMap[l.scopeName] = l;
        });
    }

    _createClass(Resolver, [{
        key: 'getOnigLib',
        value: function getOnigLib() {
            return this._onigLibPromise;
        }
    }, {
        key: 'getOnigLibName',
        value: function getOnigLibName() {
            return this._onigLibName;
        }
    }, {
        key: 'loadGrammar',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(scopeName) {
                var lang, g;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                lang = this.scopeToLangMap[scopeName];

                                if (lang) {
                                    _context.next = 3;
                                    break;
                                }

                                return _context.abrupt('return', null);

                            case 3:
                                if (!lang.grammar) {
                                    _context.next = 5;
                                    break;
                                }

                                return _context.abrupt('return', lang.grammar);

                            case 5:
                                _context.next = 7;
                                return readGrammarFromPath(lang.path);

                            case 7:
                                g = _context.sent;

                                lang.grammar = g;
                                return _context.abrupt('return', g);

                            case 10:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function loadGrammar(_x) {
                return _ref.apply(this, arguments);
            }

            return loadGrammar;
        }()
    }]);

    return Resolver;
}();

function readGrammarFromPath(path) {
    return new Promise(function (c, e) {
        fs.readFile(path, function (error, content) {
            if (error) {
                e(error);
            } else {
                c((0, _vscodeTextmate.parseRawGrammar)(content.toString(), path));
            }
        });
    });
}