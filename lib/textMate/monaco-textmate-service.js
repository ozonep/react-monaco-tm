"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MonacoTextmateService = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vscodeTextmate = require('vscode-textmate');

var _textmateContribution = require('./textmate-contribution');

var _textmateTokenizer = require('./textmate-tokenizer');

var _textmateRegistry = require('./textmate-registry');

var _monacoThemeRegistry = require('./monaco-theme-registry');

var _monacoTextmateFrontendBindings = require('./monaco-textmate-frontend-bindings');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MonacoTextmateService = exports.MonacoTextmateService = function () {
    function MonacoTextmateService() {
        _classCallCheck(this, MonacoTextmateService);

        this.onigasmPromise = (0, _monacoTextmateFrontendBindings.onigasmPromise)();
    }

    _createClass(MonacoTextmateService, [{
        key: 'initialize',
        value: function initialize() {
            var _this = this;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.grammarProviders.getContributions()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var grammarProvider = _step.value;

                    try {
                        grammarProvider.registerTextmateLanguage(_textmateRegistry.TextmateRegistry);
                    } catch (err) {
                        console.error(err);
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.grammarRegistry = new _vscodeTextmate.Registry({
                getOnigLib: function getOnigLib() {
                    return _this.onigasmPromise;
                },
                theme: _monacoThemeRegistry.MonacoThemeRegistry.getTheme(_monacoThemeRegistry.DARK_SCICODE_THEME),
                loadGrammar: function () {
                    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(scopeName) {
                        var provider, definition, rawGrammar;
                        return regeneratorRuntime.wrap(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        provider = _textmateRegistry.TextmateRegistry.getProvider(scopeName);

                                        if (!provider) {
                                            _context.next = 8;
                                            break;
                                        }

                                        _context.next = 4;
                                        return provider.getGrammarDefinition();

                                    case 4:
                                        definition = _context.sent;
                                        rawGrammar = void 0;

                                        if (typeof definition.content === 'string') {
                                            rawGrammar = (0, _vscodeTextmate.parseRawGrammar)(definition.content, 'grammar.json');
                                        } else {
                                            rawGrammar = definition.content;
                                        }
                                        return _context.abrupt('return', rawGrammar);

                                    case 8:
                                        return _context.abrupt('return', undefined);

                                    case 9:
                                    case 'end':
                                        return _context.stop();
                                }
                            }
                        }, _callee, _this);
                    }));

                    return function loadGrammar(_x) {
                        return _ref.apply(this, arguments);
                    };
                }(),
                getInjections: function getInjections(scopeName) {
                    var provider = _textmateRegistry.TextmateRegistry.getProvider(scopeName);
                    if (provider && provider.getInjections) {
                        return provider.getInjections(scopeName);
                    }
                    return [];
                }
            });
            var theme = _monacoThemeRegistry.DARK_SCICODE_THEME;
            // if (theme) this.grammarRegistry.setTheme(theme);
            var registered = new Set();

            var _loop = function _loop(_ref2) {
                var id = _ref2.id;

                if (!registered.has(id)) {
                    monaco.languages.onLanguage(id, function () {
                        return _this.activateLanguage(id);
                    });
                    registered.add(id);
                }
            };

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = monaco.languages.getLanguages()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _ref2 = _step2.value;

                    _loop(_ref2);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }, {
        key: 'activateLanguage',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(languageId) {
                var scopeName, provider, configuration, initialLanguage, grammar, options;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                scopeName = _textmateRegistry.TextmateRegistry.getScope(languageId);

                                if (scopeName) {
                                    _context2.next = 3;
                                    break;
                                }

                                return _context2.abrupt('return');

                            case 3:
                                provider = _textmateRegistry.TextmateRegistry.getProvider(scopeName);

                                if (provider) {
                                    _context2.next = 6;
                                    break;
                                }

                                return _context2.abrupt('return');

                            case 6:
                                configuration = _textmateRegistry.TextmateRegistry.getGrammarConfiguration(languageId);
                                initialLanguage = (0, _textmateContribution.getEncodedLanguageId)(languageId);
                                _context2.next = 10;
                                return this.onigasmPromise;

                            case 10:
                                _context2.prev = 10;
                                _context2.next = 13;
                                return this.grammarRegistry.loadGrammarWithConfiguration(scopeName, initialLanguage, configuration);

                            case 13:
                                grammar = _context2.sent;
                                options = configuration.tokenizerOption ? configuration.tokenizerOption : _textmateTokenizer.TokenizerOption;

                                monaco.languages.setTokensProvider(languageId, (0, _textmateTokenizer.createTextmateTokenizer)(grammar, options));
                                _context2.next = 21;
                                break;

                            case 18:
                                _context2.prev = 18;
                                _context2.t0 = _context2['catch'](10);

                                this.logger.warn('No grammar for this language id', languageId, _context2.t0);

                            case 21:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[10, 18]]);
            }));

            function activateLanguage(_x2) {
                return _ref3.apply(this, arguments);
            }

            return activateLanguage;
        }()
    }]);

    return MonacoTextmateService;
}();