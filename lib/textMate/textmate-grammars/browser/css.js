'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CssContribution = exports.CssContribution = function () {
    function CssContribution() {
        _classCallCheck(this, CssContribution);

        this.id = 'css';
        this.scopeName = 'source.css';
    }

    _createClass(CssContribution, [{
        key: 'registerTextmateLanguage',
        value: function registerTextmateLanguage(registry) {
            monaco.languages.register({
                id: this.id,
                extensions: ['.css'],
                aliases: ['CSS', 'css'],
                mimetypes: ['text/css']
            });
            monaco.languages.setLanguageConfiguration(this.id, {
                wordPattern: /(#?-?\d*\.\d\w*%?)|((::|[@#.!:])?[\w-?]+%?)|::|[@#.!:]/g,
                comments: {
                    blockComment: ['/*', '*/']
                },
                brackets: [['{', '}'], ['[', ']'], ['(', ')']],
                autoClosingPairs: [{ open: '{', close: '}', notIn: ['string', 'comment'] }, { open: '[', close: ']', notIn: ['string', 'comment'] }, { open: '(', close: ')', notIn: ['string', 'comment'] }, { open: '"', close: '"', notIn: ['string', 'comment'] }, { open: '\'', close: '\'', notIn: ['string', 'comment'] }],
                surroundingPairs: [{ open: '{', close: '}' }, { open: '[', close: ']' }, { open: '(', close: ')' }, { open: '"', close: '"' }, { open: '\'', close: '\'' }],
                folding: {
                    markers: {
                        start: new RegExp('^\\s*\\/\\*\\s*#region\\b\\s*(.*?)\\s*\\*\\/'),
                        end: new RegExp('^\\s*\\/\\*\\s*#endregion\\b.*\\*\\/')
                    }
                }
            });
            var grammar = require('../data/css.json.tmLanguage');
            registry.registerTextmateGrammarScope(this.scopeName, {
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
            registry.mapLanguageIdToTextmateGrammar(this.id, this.scopeName);
        }
    }]);

    return CssContribution;
}();