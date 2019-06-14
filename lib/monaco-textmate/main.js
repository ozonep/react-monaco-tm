"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.INITIAL = exports.Registry = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.parseJSONGrammar = parseJSONGrammar;

var _registry = require('./registry');

var _theme = require('./theme');

var _grammar = require('./grammar');

var _json = require('json5');

var _json2 = _interopRequireDefault(_json);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function parseJSONGrammar(contents) {
    return _json2.default.parse(contents);
}

var Registry = exports.Registry = function () {
    function Registry() {
        var locator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { loadGrammar: function loadGrammar() {
                return null;
            } };

        _classCallCheck(this, Registry);

        this._locator = locator;
        this._syncRegistry = new _registry.SyncRegistry(_theme.Theme.createFromRawTheme(locator.theme), locator.getOnigLib && locator.getOnigLib());
    }

    _createClass(Registry, [{
        key: 'setTheme',
        value: function setTheme(theme) {
            this._syncRegistry.setTheme(_theme.Theme.createFromRawTheme(theme));
        }
    }, {
        key: 'getColorMap',
        value: function getColorMap() {
            return this._syncRegistry.getColorMap();
        }
    }, {
        key: 'loadGrammarWithEmbeddedLanguages',
        value: function loadGrammarWithEmbeddedLanguages(initialScopeName, initialLanguage, embeddedLanguages) {
            return this.loadGrammarWithConfiguration(initialScopeName, initialLanguage, { embeddedLanguages: embeddedLanguages });
        }
    }, {
        key: 'loadGrammarWithConfiguration',
        value: function loadGrammarWithConfiguration(initialScopeName, initialLanguage, configuration) {
            return this._loadGrammar(initialScopeName, initialLanguage, configuration.embeddedLanguages, configuration.tokenTypes);
        }
    }, {
        key: 'loadGrammar',
        value: function loadGrammar(initialScopeName) {
            return this._loadGrammar(initialScopeName, 0, null, null);
        }
    }, {
        key: '_loadGrammar',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(initialScopeName, initialLanguage, embeddedLanguages, tokenTypes) {
                var remainingScopeNames, seenScopeNames, scopeName, grammar, injections, deps;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                remainingScopeNames = [initialScopeName];
                                seenScopeNames = {};

                                seenScopeNames[initialScopeName] = true;

                            case 3:
                                if (!(remainingScopeNames.length > 0)) {
                                    _context.next = 20;
                                    break;
                                }

                                scopeName = remainingScopeNames.shift();

                                if (!this._syncRegistry.lookup(scopeName)) {
                                    _context.next = 7;
                                    break;
                                }

                                return _context.abrupt('continue', 3);

                            case 7:
                                _context.next = 9;
                                return this._locator.loadGrammar(scopeName);

                            case 9:
                                grammar = _context.sent;

                                if (grammar) {
                                    _context.next = 15;
                                    break;
                                }

                                if (!(scopeName === initialScopeName)) {
                                    _context.next = 13;
                                    break;
                                }

                                throw new Error('No grammar provided for <' + initialScopeName);

                            case 13:
                                _context.next = 18;
                                break;

                            case 15:
                                injections = typeof this._locator.getInjections === 'function' && this._locator.getInjections(scopeName);
                                deps = this._syncRegistry.addGrammar(grammar, injections);

                                deps.forEach(function (dep) {
                                    if (!seenScopeNames[dep]) {
                                        seenScopeNames[dep] = true;
                                        remainingScopeNames.push(dep);
                                    }
                                });

                            case 18:
                                _context.next = 3;
                                break;

                            case 20:
                                return _context.abrupt('return', this.grammarForScopeName(initialScopeName, initialLanguage, embeddedLanguages, tokenTypes));

                            case 21:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function _loadGrammar(_x2, _x3, _x4, _x5) {
                return _ref.apply(this, arguments);
            }

            return _loadGrammar;
        }()
    }, {
        key: 'addGrammar',
        value: function addGrammar(rawGrammar) {
            var injections = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
            var initialLanguage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var embeddedLanguages = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

            this._syncRegistry.addGrammar(rawGrammar, injections);
            return this.grammarForScopeName(rawGrammar.scopeName, initialLanguage, embeddedLanguages);
        }
    }, {
        key: 'grammarForScopeName',
        value: function grammarForScopeName(scopeName) {
            var initialLanguage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var embeddedLanguages = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            var tokenTypes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

            return this._syncRegistry.grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes);
        }
    }]);

    return Registry;
}();

var INITIAL = exports.INITIAL = _grammar.StackElement.NULL;