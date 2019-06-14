"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SyncRegistry = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _grammar = require('./grammar');

var _onigLibs = require('./onigLibs');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SyncRegistry = exports.SyncRegistry = function () {
    function SyncRegistry(theme, onigLibPromise) {
        _classCallCheck(this, SyncRegistry);

        this._theme = theme;
        this._grammars = {};
        this._rawGrammars = {};
        this._injectionGrammars = {};
        this._onigLibPromise = onigLibPromise || (0, _onigLibs.getOnigasm)();
    }

    _createClass(SyncRegistry, [{
        key: 'setTheme',
        value: function setTheme(theme) {
            var _this = this;

            this._theme = theme;
            Object.keys(this._grammars).forEach(function (scopeName) {
                var grammar = _this._grammars[scopeName];
                grammar.onDidChangeTheme();
            });
        }
    }, {
        key: 'getColorMap',
        value: function getColorMap() {
            return this._theme.getColorMap();
        }
    }, {
        key: 'addGrammar',
        value: function addGrammar(grammar, injectionScopeNames) {
            this._rawGrammars[grammar.scopeName] = grammar;
            var includedScopes = {};
            (0, _grammar.collectIncludedScopes)(includedScopes, grammar);
            if (injectionScopeNames) {
                this._injectionGrammars[grammar.scopeName] = injectionScopeNames;
                injectionScopeNames.forEach(function (scopeName) {
                    includedScopes[scopeName] = true;
                });
            }
            return Object.keys(includedScopes);
        }
    }, {
        key: 'lookup',
        value: function lookup(scopeName) {
            return this._rawGrammars[scopeName];
        }
    }, {
        key: 'injections',
        value: function injections(targetScope) {
            return this._injectionGrammars[targetScope];
        }
    }, {
        key: 'getDefaults',
        value: function getDefaults() {
            return this._theme.getDefaults();
        }
    }, {
        key: 'themeMatch',
        value: function themeMatch(scopeName) {
            return this._theme.match(scopeName);
        }
    }, {
        key: 'grammarForScopeName',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(scopeName, initialLanguage, embeddedLanguages, tokenTypes) {
                var rawGrammar;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (this._grammars[scopeName]) {
                                    _context.next = 14;
                                    break;
                                }

                                rawGrammar = this._rawGrammars[scopeName];

                                if (rawGrammar) {
                                    _context.next = 4;
                                    break;
                                }

                                return _context.abrupt('return', null);

                            case 4:
                                _context.t0 = _grammar.createGrammar;
                                _context.t1 = rawGrammar;
                                _context.t2 = initialLanguage;
                                _context.t3 = embeddedLanguages;
                                _context.t4 = tokenTypes;
                                _context.t5 = this;
                                _context.next = 12;
                                return this._onigLibPromise;

                            case 12:
                                _context.t6 = _context.sent;
                                this._grammars[scopeName] = (0, _context.t0)(_context.t1, _context.t2, _context.t3, _context.t4, _context.t5, _context.t6);

                            case 14:
                                return _context.abrupt('return', this._grammars[scopeName]);

                            case 15:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function grammarForScopeName(_x, _x2, _x3, _x4) {
                return _ref.apply(this, arguments);
            }

            return grammarForScopeName;
        }()
    }]);

    return SyncRegistry;
}();