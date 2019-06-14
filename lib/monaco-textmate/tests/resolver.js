'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Resolver = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var readGrammarFromPath = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(path) {
        var content;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        console.log('THIS IS PATH', path);
                        _context.next = 3;
                        return fetch(path);

                    case 3:
                        _context.next = 5;
                        return _context.sent.text();

                    case 5:
                        content = _context.sent;
                        return _context.abrupt('return', (0, _main.parseJSONGrammar)(content.toString()));

                    case 7:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function readGrammarFromPath(_x) {
        return _ref.apply(this, arguments);
    };
}();

var _filer = require('filer');

var _filer2 = _interopRequireDefault(_filer);

var _main = require('../main');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = _filer2.default.Path;

var Resolver = exports.Resolver = function () {
    function Resolver(grammars, languages, onigLibPromise) {
        _classCallCheck(this, Resolver);

        this._grammars = grammars;
        this._languages = languages;
        this._onigLibPromise = onigLibPromise;
        this.language2id = Object.create(null);
        this._lastLanguageId = 0;
        this._id2language = [];
        for (var i = 0; i < this._languages.length; i++) {
            var languageId = ++this._lastLanguageId;
            this.language2id[this._languages[i].id] = languageId;
            this._id2language[languageId] = this._languages[i].id;
        }
    }

    _createClass(Resolver, [{
        key: 'getOnigLib',
        value: function getOnigLib() {
            return this._onigLibPromise;
        }
    }, {
        key: 'findLanguageByExtension',
        value: function findLanguageByExtension(fileExtension) {
            for (var i = 0; i < this._languages.length; i++) {
                var language = this._languages[i];
                if (!language.extensions) {
                    continue;
                }
                for (var j = 0; j < language.extensions.length; j++) {
                    var extension = language.extensions[j];
                    if (extension === fileExtension) {
                        return language.id;
                    }
                }
            }
            return null;
        }
    }, {
        key: 'findScopeByFilename',
        value: function findScopeByFilename(filename) {
            var language = this.findLanguageByExtension(path.extname(filename));
            if (language) {
                var grammar = this.findGrammarByLanguage(language);
                if (grammar) {
                    return grammar.scopeName;
                }
            }
            return null;
        }
    }, {
        key: 'findGrammarByLanguage',
        value: function findGrammarByLanguage(language) {
            for (var i = 0; i < this._grammars.length; i++) {
                var grammar = this._grammars[i];
                if (grammar.language === language) {
                    return grammar;
                }
            }
            throw new Error('Could not findGrammarByLanguage for ' + language);
        }
    }, {
        key: 'loadGrammar',
        value: function loadGrammar(scopeName) {
            for (var i = 0; i < this._grammars.length; i++) {
                var grammar = this._grammars[i];
                if (grammar.scopeName === scopeName) {
                    if (!grammar.grammar) {
                        grammar.grammar = readGrammarFromPath(grammar.path);
                    }
                    return grammar.grammar;
                }
            }
            return null;
        }
    }]);

    return Resolver;
}();