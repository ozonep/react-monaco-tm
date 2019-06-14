'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];

var HtmlContribution = exports.HtmlContribution = function () {
    function HtmlContribution() {
        _classCallCheck(this, HtmlContribution);

        this.id = 'html';
        this.scopeName = 'text.html.basic';
    }

    _createClass(HtmlContribution, [{
        key: 'registerTextmateLanguage',
        value: function registerTextmateLanguage(registry) {
            monaco.languages.register({
                id: this.id,
                extensions: ['.html', '.htm', '.shtml', '.xhtml', '.mdoc', '.jsp', '.asp', '.aspx', '.jshtm'],
                aliases: ['HTML', 'htm', 'html', 'xhtml'],
                mimetypes: ['text/html', 'text/x-jshtm', 'text/template', 'text/ng-template']
            });
            monaco.languages.setLanguageConfiguration(this.id, {
                wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
                comments: {
                    blockComment: ['<!--', '-->']
                },
                brackets: [['<!--', '-->'], ['<', '>'], ['{', '}'], ['(', ')']],
                autoClosingPairs: [{ open: '{', close: '}' }, { open: '[', close: ']' }, { open: '(', close: ')' }, { open: '"', close: '"' }, { open: '\'', close: '\'' }],

                surroundingPairs: [{ open: '"', close: '"' }, { open: '\'', close: '\'' }, { open: '{', close: '}' }, { open: '[', close: ']' }, { open: '(', close: ')' }, { open: '<', close: '>' }],
                onEnterRules: [{
                    beforeText: new RegExp('<(?!(?:' + EMPTY_ELEMENTS.join('|') + '))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$', 'i'),
                    afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                    action: { indentAction: monaco.languages.IndentAction.IndentOutdent }
                }, {
                    beforeText: new RegExp('<(?!(?:' + EMPTY_ELEMENTS.join('|') + '))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$', 'i'),
                    action: { indentAction: monaco.languages.IndentAction.Indent }
                }],
                folding: {
                    markers: {
                        start: new RegExp('^\\s*<!--\\s*#region\\b.*-->'),
                        end: new RegExp('^\\s*<!--\\s*#endregion\\b.*-->')
                    }
                }
            });

            var grammar = require('../data/html.json.tmLanguage');
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

    return HtmlContribution;
}();