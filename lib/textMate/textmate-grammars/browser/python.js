'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PythonContribution = exports.PythonContribution = function () {
    function PythonContribution() {
        _classCallCheck(this, PythonContribution);

        this.id = 'python';
        this.config = {
            comments: {
                lineComment: '#'
            },
            brackets: [['{', '}'], ['[', ']'], ['(', ')']],
            autoClosingPairs: [{ open: '[', close: ']' }, { open: '{', close: '}' }, { open: '(', close: ')' }, { open: '\'', close: '\'', notIn: ['string', 'comment'] }, { open: '"', close: '"', notIn: ['string'] }],
            surroundingPairs: [{ open: '{', close: '}' }, { open: '[', close: ']' }, { open: '(', close: ')' }, { open: '"', close: '"' }, { open: '\'', close: '\'' }],
            folding: {
                markers: {
                    start: new RegExp('^\\s*#pragma\\s+region\\b'),
                    end: new RegExp('^\\s*#pragma\\s+endregion\\b')
                }
            },
            onEnterRules: [{
                beforeText: /^\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\s*$/,
                action: { indentAction: monaco.languages.IndentAction.Indent }
            }]
        };
    }

    _createClass(PythonContribution, [{
        key: 'registerTextmateLanguage',
        value: function registerTextmateLanguage(registry) {
            monaco.languages.register({
                id: this.id,
                extensions: ['.py', '.rpy', '.pyw', '.cpy', '.gyp', '.gypi', '.snakefile', '.smk'],
                aliases: ['Python', 'py'],
                firstLine: '^#!\\s*/.*\\bpython[0-9.-]*\\b'
            });

            monaco.languages.setLanguageConfiguration(this.id, this.config);

            var platformGrammar = require('../../data/MagicPython.tmLanguage.json');
            registry.registerTextmateGrammarScope('source.python', {
                getGrammarDefinition: function getGrammarDefinition() {
                    var _this = this;

                    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                        return regeneratorRuntime.wrap(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        return _context.abrupt('return', {
                                            format: 'json',
                                            content: platformGrammar
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

            var cGrammar = require('../data/MagicRegExp.tmLanguage.json');
            registry.registerTextmateGrammarScope('source.regexp.python', {
                getGrammarDefinition: function getGrammarDefinition() {
                    var _this2 = this;

                    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        return _context2.abrupt('return', {
                                            format: 'json',
                                            content: cGrammar
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
            registry.mapLanguageIdToTextmateGrammar(this.id, 'source.python');
        }
    }]);

    return PythonContribution;
}();