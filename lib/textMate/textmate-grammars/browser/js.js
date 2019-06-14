'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JavascriptContribution = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _textmateContribution = require('../../textmate/textmate-contribution');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JavascriptContribution = exports.JavascriptContribution = function () {
    function JavascriptContribution() {
        _classCallCheck(this, JavascriptContribution);

        this.js_id = 'javascript';
        this.js_react_id = 'javascriptreact';
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

    _createClass(JavascriptContribution, [{
        key: 'registerTextmateLanguage',
        value: function registerTextmateLanguage(registry) {
            this.registerJavaScript();
            var grammar = require('../data/javascript.tmlanguage.json');
            registry.registerTextmateGrammarScope('source.js', {
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
            registry.registerGrammarConfiguration(this.js_id, {
                embeddedLanguages: {
                    'meta.tag.js': (0, _textmateContribution.getEncodedLanguageId)('jsx-tags'),
                    'meta.tag.without-attributes.js': (0, _textmateContribution.getEncodedLanguageId)('jsx-tags'),
                    'meta.tag.attributes.js.jsx': (0, _textmateContribution.getEncodedLanguageId)('javascriptreact'),
                    'meta.embedded.expression.js': (0, _textmateContribution.getEncodedLanguageId)('javascriptreact')
                },
                tokenTypes: {
                    'entity.name.type.instance.jsdoc': 0,
                    'entity.name.function.tagged-template': 0,
                    'meta.import string.quoted': 0,
                    'variable.other.jsdoc': 0
                }
            });

            registry.mapLanguageIdToTextmateGrammar(this.js_id, 'source.js');

            var jsxGrammar = require('../data/javascript.jsx.tmlanguage.json');
            registry.registerTextmateGrammarScope('source.jsx', {
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

            registry.mapLanguageIdToTextmateGrammar(this.js_react_id, 'source.jsx');
        }
    }, {
        key: 'registerJavaScript',
        value: function registerJavaScript() {
            var _this3 = this;

            monaco.languages.register({
                id: this.js_id,
                aliases: ['JavaScript', 'javascript', 'js'],
                extensions: ['.js', '.es6', '.mjs', '.pac'],
                filenames: ['jakefile'],
                firstLine: '^#!.*\\bnode',
                mimetypes: ['text/javascript']
            });

            monaco.languages.onLanguage(this.js_id, function () {
                monaco.languages.setLanguageConfiguration(_this3.js_id, _this3.configuration);
            });

            monaco.languages.register({
                id: this.js_react_id,
                aliases: ['JavaScript React', 'jsx'],
                extensions: ['.jsx']
            });
            monaco.languages.onLanguage(this.js_react_id, function () {
                monaco.languages.setLanguageConfiguration(_this3.js_react_id, _this3.configuration);
            });
        }
    }]);

    return JavascriptContribution;
}();