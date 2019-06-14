'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TypescriptContribution = exports.TypescriptContribution = function () {
    function TypescriptContribution() {
        _classCallCheck(this, TypescriptContribution);

        this.ts_id = 'typescript';
        this.ts_react_id = 'typescriptreact';
        this.configuration = {
            'comments': {
                'lineComment': '//',
                'blockComment': ['/*', '*/']
            },
            'brackets': [['{', '}'], ['[', ']'], ['(', ')']],
            'autoClosingPairs': [{ 'open': '{', 'close': '}' }, { 'open': '[', 'close': ']' }, { 'open': '(', 'close': ')' }, { 'open': "'", 'close': "'", 'notIn': ['string', 'comment'] }, { 'open': '"', 'close': '"', 'notIn': ['string'] }, { 'open': '`', 'close': '`', 'notIn': ['string', 'comment'] }, { 'open': '/**', 'close': ' */', 'notIn': ['string'] }],
            'surroundingPairs': [{ 'open': '{', 'close': '}' }, { 'open': '[', 'close': ']' }, { 'open': '(', 'close': ')' }, { 'open': "'", 'close': "'" }, { 'open': '"', 'close': '"' }, { 'open': '`', 'close': '`' }],
            'folding': {
                'markers': {
                    'start': new RegExp('^\\s*//\\s*#?region\\b'),
                    'end': new RegExp('^\\s*//\\s*#?endregion\\b')
                }
            }
        };
    }

    _createClass(TypescriptContribution, [{
        key: 'registerTextmateLanguage',
        value: function registerTextmateLanguage(registry) {
            this.registerTypeScript();
            var grammar = require('../data/typescript.json.tmlanguage');
            registry.registerTextmateGrammarScope('source.ts', {
                getGrammarDefinition: function getGrammarDefinition() {
                    var _this = this;

                    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                        return regeneratorRuntime.wrap(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        return _context.abrupt('return', {
                                            format: 'json',
                                            content: grammar
                                        });

                                    case 1:
                                    case 'end':
                                        return _context.stop();
                                }
                            }
                        }, _callee, _this);
                    }))();
                }
            });

            registry.mapLanguageIdToTextmateGrammar(this.ts_id, 'source.ts');
            registry.registerGrammarConfiguration(this.ts_id, {
                tokenTypes: {
                    'entity.name.type.instance.jsdoc': 0,
                    'entity.name.function.tagged-template': 0,
                    'meta.import string.quoted': 0,
                    'variable.other.jsdoc': 0
                }
            });

            var jsxGrammar = require('../data/typescript.tsx.json.tmlanguage');
            registry.registerTextmateGrammarScope('source.tsx', {
                getGrammarDefinition: function getGrammarDefinition() {
                    var _this2 = this;

                    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        return _context2.abrupt('return', {
                                            format: 'json',
                                            content: jsxGrammar
                                        });

                                    case 1:
                                    case 'end':
                                        return _context2.stop();
                                }
                            }
                        }, _callee2, _this2);
                    }))();
                }
            });

            registry.mapLanguageIdToTextmateGrammar(this.ts_react_id, 'source.tsx');
        }
    }, {
        key: 'registerTypeScript',
        value: function registerTypeScript() {
            var _this3 = this;

            monaco.languages.register({
                id: this.ts_id,
                aliases: ['TypeScript', 'typescript', 'ts'],
                extensions: ['.ts'],
                mimetypes: ['text/typescript']
            });

            monaco.languages.onLanguage(this.ts_id, function () {
                monaco.languages.setLanguageConfiguration(_this3.ts_id, _this3.configuration);
            });

            monaco.languages.register({
                id: this.ts_react_id,
                aliases: ['TypeScript React', 'tsx'],
                extensions: ['.tsx']
            });
            monaco.languages.onLanguage(this.ts_react_id, function () {
                monaco.languages.setLanguageConfiguration(_this3.ts_react_id, _this3.configuration);
            });
        }
    }]);

    return TypescriptContribution;
}();