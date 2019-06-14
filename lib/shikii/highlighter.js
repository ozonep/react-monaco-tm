"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getHighlighter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var getHighlighter = exports.getHighlighter = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(options) {
        var theme, langs, langRegistrations, s;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        theme = void 0;

                        if (options.theme.name) theme = options.theme;
                        langs = [].concat(_toConsumableArray(_lang.commonLangIds), _toConsumableArray(_lang.commonLangAliases));
                        langRegistrations = (0, _lang.getLangRegistrations)(langs);
                        s = new Shiki(theme, langRegistrations);
                        _context.next = 7;
                        return s.getHighlighter();

                    case 7:
                        return _context.abrupt('return', _context.sent);

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getHighlighter(_x) {
        return _ref.apply(this, arguments);
    };
}();

var _vscodeTextmate = require('vscode-textmate');

var _lang = require('./lang');

var _resolver = require('./resolver');

var _onigLibs = require('./onigLibs');

var _themedTokenizer = require('./themedTokenizer');

var _renderer = require('./renderer');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Shiki = function () {
    function Shiki(theme, langs) {
        _classCallCheck(this, Shiki);

        this._resolver = new _resolver.Resolver(langs, (0, _onigLibs.getOnigasm)(), 'onigasm');
        this._registry = new _vscodeTextmate.Registry(this._resolver);
        this._registry.setTheme(theme);
        this._theme = theme;
        this._colorMap = this._registry.getColorMap();
        this._langs = langs;
    }

    _createClass(Shiki, [{
        key: 'getHighlighter',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                var _this = this;

                var ltog;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                ltog = {};
                                _context3.next = 3;
                                return Promise.all(this._langs.map(function () {
                                    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(l) {
                                        var grammar;
                                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        _context2.next = 2;
                                                        return _this._registry.loadGrammar(l.scopeName);

                                                    case 2:
                                                        grammar = _context2.sent;

                                                        ltog[l.id] = grammar;
                                                        l.aliases.forEach(function (la) {
                                                            ltog[la] = grammar;
                                                        });

                                                    case 5:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, _this);
                                    }));

                                    return function (_x2) {
                                        return _ref3.apply(this, arguments);
                                    };
                                }()));

                            case 3:
                                return _context3.abrupt('return', {
                                    codeToThemedTokens: function codeToThemedTokens(code, lang) {
                                        return (0, _themedTokenizer.tokenizeWithTheme)(_this._theme, _this._colorMap, code, ltog[lang]);
                                    },
                                    codeToHtml: function codeToHtml(code, lang) {
                                        var tokens = (0, _themedTokenizer.tokenizeWithTheme)(_this._theme, _this._colorMap, code, ltog[lang]);
                                        return (0, _renderer.renderToHtml)(tokens, {
                                            bg: _this._theme.bg
                                        });
                                    }
                                });

                            case 4:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function getHighlighter() {
                return _ref2.apply(this, arguments);
            }

            return getHighlighter;
        }()
    }]);

    return Shiki;
}();