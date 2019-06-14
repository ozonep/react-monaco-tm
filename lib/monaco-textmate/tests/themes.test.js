'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _assert = require('assert');

var assert = _interopRequireWildcard(_assert);

var _main = require('../main');

var _grammar = require('../grammar');

var _theme = require('../theme');

var _themeTest = require('./themeTest');

var _onigLibs = require('../onigLibs');

var _resolver = require('./resolver');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var THEMES_TEST_PATH = path.join(__dirname, '../../test-cases/themes');

var ThemeInfo = function () {
    function ThemeInfo(themeName, filename, includeFilename) {
        _classCallCheck(this, ThemeInfo);

        this._themeName = themeName;
        this._filename = filename;
        this._includeFilename = includeFilename;
    }

    _createClass(ThemeInfo, [{
        key: 'create',
        value: function create(resolver) {
            var theme = ThemeInfo._loadThemeFile(this._filename);
            if (this._includeFilename) {
                var includeTheme = ThemeInfo._loadThemeFile(this._includeFilename);
                theme.settings = includeTheme.settings.concat(theme.settings);
            }
            var registry = new _main.Registry(resolver);
            registry.setTheme(theme);
            return {
                themeName: this._themeName,
                theme: theme,
                registry: registry
            };
        }
    }], [{
        key: '_loadThemeFile',
        value: function _loadThemeFile(filename) {
            var fullPath = path.join(THEMES_TEST_PATH, filename);
            var fileContents = fs.readFileSync(fullPath).toString();
            if (/\.json$/.test(filename)) {
                return JSON.parse(fileContents);
            }
        }
    }]);

    return ThemeInfo;
}();

(function () {
    var _this = this;

    var THEMES = [new ThemeInfo('abyss', 'Abyss.tmTheme'), new ThemeInfo('dark_vs', 'dark_vs.json'), new ThemeInfo('light_vs', 'light_vs.json'), new ThemeInfo('hc_black', 'hc_black.json'), new ThemeInfo('dark_plus', 'dark_plus.json', 'dark_vs.json'), new ThemeInfo('light_plus', 'light_plus.json', 'light_vs.json'), new ThemeInfo('kimbie_dark', 'Kimbie_dark.tmTheme'), new ThemeInfo('monokai', 'Monokai.tmTheme'), new ThemeInfo('monokai_dimmed', 'dimmed-monokai.tmTheme'), new ThemeInfo('quietlight', 'QuietLight.tmTheme'), new ThemeInfo('red', 'red.tmTheme'), new ThemeInfo('solarized_dark', 'Solarized-dark.tmTheme'), new ThemeInfo('solarized_light', 'Solarized-light.tmTheme'), new ThemeInfo('tomorrow_night_blue', 'Tomorrow-Night-Blue.tmTheme')];
    var _grammars = JSON.parse(fs.readFileSync(path.join(THEMES_TEST_PATH, 'grammars.json')).toString('utf8'));
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = _grammars[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var grammar = _step.value;

            grammar.path = path.join(THEMES_TEST_PATH, grammar.path);
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

    var _languages = JSON.parse(fs.readFileSync(path.join(THEMES_TEST_PATH, 'languages.json')).toString('utf8'));
    var _resolvers = [new _resolver.Resolver(_grammars, _languages, (0, _onigLibs.getOnigasm)(), 'onigasm')];
    var _themeDatas = _resolvers.map(function (resolver) {
        return THEMES.map(function (theme) {
            return theme.create(resolver);
        });
    });
    describe('Theme suite', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var testFiles, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, testFile, _loop, i;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        testFiles = fs.readdirSync(path.join(THEMES_TEST_PATH, 'tests'));

                        testFiles = testFiles.filter(function (testFile) {
                            return !/\.result$/.test(testFile);
                        });
                        testFiles = testFiles.filter(function (testFile) {
                            return !/\.result.patch$/.test(testFile);
                        });
                        testFiles = testFiles.filter(function (testFile) {
                            return !/\.actual$/.test(testFile);
                        });
                        testFiles = testFiles.filter(function (testFile) {
                            return !/\.diff.html$/.test(testFile);
                        });
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context.prev = 8;
                        for (_iterator2 = testFiles[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            testFile = _step2.value;

                            _loop = function _loop(i) {
                                var test = new _themeTest.ThemeTest(THEMES_TEST_PATH, testFile, _resolvers[i]);
                                it(test.testName, function () {
                                    return test.evaluate(_themeDatas[i]).then(function (_) {
                                        assert.ok(!test.hasDiff(), 'no more unpatched differences');
                                    });
                                }).timeout(20000);
                            };

                            for (i = 0; i < _resolvers.length; i++) {
                                _loop(i);
                            }
                        }
                        _context.next = 16;
                        break;

                    case 12:
                        _context.prev = 12;
                        _context.t0 = _context['catch'](8);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context.t0;

                    case 16:
                        _context.prev = 16;
                        _context.prev = 17;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 19:
                        _context.prev = 19;

                        if (!_didIteratorError2) {
                            _context.next = 22;
                            break;
                        }

                        throw _iteratorError2;

                    case 22:
                        return _context.finish(19);

                    case 23:
                        return _context.finish(16);

                    case 24:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, _this, [[8, 12, 16, 24], [17,, 19, 23]]);
    })));
})();
describe('Theme matching', function () {
    it('gives higher priority to deeper matches', function () {
        var theme = _theme.Theme.createFromRawTheme({
            settings: [{ settings: { foreground: '#100000', background: '#200000' } }, { scope: 'punctuation.definition.string.begin.html', settings: { foreground: '#300000' } }, { scope: 'meta.tag punctuation.definition.string', settings: { foreground: '#400000' } }]
        });
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#100000');
        var _B = colorMap.getId('#200000');
        var _C = colorMap.getId('#400000');
        var _D = colorMap.getId('#300000');
        var actual = theme.match('punctuation.definition.string.begin.html');
        assert.deepStrictEqual(actual, [new _theme.ThemeTrieElementRule(5, null, -1 /* NotSet */, _D, _NOT_SET), new _theme.ThemeTrieElementRule(3, ['meta.tag'], -1 /* NotSet */, _C, _NOT_SET)]);
    });
    it('gives higher priority to parent matches 1', function () {
        var theme = _theme.Theme.createFromRawTheme({
            settings: [{ settings: { foreground: '#100000', background: '#200000' } }, { scope: 'c a', settings: { foreground: '#300000' } }, { scope: 'd a.b', settings: { foreground: '#400000' } }, { scope: 'a', settings: { foreground: '#500000' } }]
        });
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#100000');
        var _B = colorMap.getId('#200000');
        var _C = colorMap.getId('#500000');
        var _D = colorMap.getId('#300000');
        var _E = colorMap.getId('#400000');
        var actual = theme.match('a.b');
        assert.deepStrictEqual(actual, [new _theme.ThemeTrieElementRule(2, ['d'], -1 /* NotSet */, _E, _NOT_SET), new _theme.ThemeTrieElementRule(1, ['c'], -1 /* NotSet */, _D, _NOT_SET), new _theme.ThemeTrieElementRule(1, null, -1 /* NotSet */, _C, _NOT_SET)]);
    });
    it('gives higher priority to parent matches 2', function () {
        var theme = _theme.Theme.createFromRawTheme({
            settings: [{ settings: { foreground: '#100000', background: '#200000' } }, { scope: 'meta.tag entity', settings: { foreground: '#300000' } }, { scope: 'meta.selector.css entity.name.tag', settings: { foreground: '#400000' } }, { scope: 'entity', settings: { foreground: '#500000' } }]
        });
        var root = new _grammar.ScopeListElement(null, 'text.html.cshtml', 0);
        var parent = new _grammar.ScopeListElement(root, 'meta.tag.structure.any.html', 0);
        var r = _grammar.ScopeListElement.mergeMetadata(0, parent, new _grammar.ScopeMetadata('entity.name.tag.structure.any.html', 0, 0, theme.match('entity.name.tag.structure.any.html')));
        var colorMap = theme.getColorMap();
        assert.strictEqual(colorMap[_grammar.StackElementMetadata.getForeground(r)], '#300000');
    });
    it('can match', function () {
        var theme = _theme.Theme.createFromRawTheme({
            settings: [{ settings: { foreground: '#F8F8F2', background: '#272822' } }, { scope: 'source, something', settings: { background: '#100000' } }, { scope: ['bar', 'baz'], settings: { background: '#200000' } }, { scope: 'source.css selector bar', settings: { fontStyle: 'bold' } }, { scope: 'constant', settings: { fontStyle: 'italic', foreground: '#300000' } }, { scope: 'constant.numeric', settings: { foreground: '#400000' } }, { scope: 'constant.numeric.hex', settings: { fontStyle: 'bold' } }, { scope: 'constant.numeric.oct', settings: { fontStyle: 'bold italic underline' } }, { scope: 'constant.numeric.dec', settings: { fontStyle: '', foreground: '#500000' } }, { scope: 'storage.object.bar', settings: { fontStyle: '', foreground: '#600000' } }]
        });
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#F8F8F2');
        var _B = colorMap.getId('#272822');
        var _C = colorMap.getId('#200000');
        var _D = colorMap.getId('#300000');
        var _E = colorMap.getId('#400000');
        var _F = colorMap.getId('#500000');
        var _G = colorMap.getId('#100000');
        var _H = colorMap.getId('#600000');
        function assertMatch(scopeName, expected) {
            var actual = theme.match(scopeName);
            assert.deepStrictEqual(actual, expected, 'when matching <<' + scopeName + '>>');
        }
        function assertSimpleMatch(scopeName, scopeDepth, fontStyle, foreground, background) {
            assertMatch(scopeName, [new _theme.ThemeTrieElementRule(scopeDepth, null, fontStyle, foreground, background)]);
        }
        function assertNoMatch(scopeName) {
            assertMatch(scopeName, [new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)]);
        }
        assertNoMatch('');
        assertNoMatch('bazz');
        assertNoMatch('asdfg');
        assertSimpleMatch('source', 1, -1 /* NotSet */, _NOT_SET, _G);
        assertSimpleMatch('source.ts', 1, -1 /* NotSet */, _NOT_SET, _G);
        assertSimpleMatch('source.tss', 1, -1 /* NotSet */, _NOT_SET, _G);
        assertSimpleMatch('something', 1, -1 /* NotSet */, _NOT_SET, _G);
        assertSimpleMatch('something.ts', 1, -1 /* NotSet */, _NOT_SET, _G);
        assertSimpleMatch('something.tss', 1, -1 /* NotSet */, _NOT_SET, _G);
        assertSimpleMatch('baz', 1, -1 /* NotSet */, _NOT_SET, _C);
        assertSimpleMatch('baz.ts', 1, -1 /* NotSet */, _NOT_SET, _C);
        assertSimpleMatch('baz.tss', 1, -1 /* NotSet */, _NOT_SET, _C);
        assertSimpleMatch('constant', 1, 1 /* Italic */, _D, _NOT_SET);
        assertSimpleMatch('constant.string', 1, 1 /* Italic */, _D, _NOT_SET);
        assertSimpleMatch('constant.hex', 1, 1 /* Italic */, _D, _NOT_SET);
        assertSimpleMatch('constant.numeric', 2, 1 /* Italic */, _E, _NOT_SET);
        assertSimpleMatch('constant.numeric.baz', 2, 1 /* Italic */, _E, _NOT_SET);
        assertSimpleMatch('constant.numeric.hex', 3, 2 /* Bold */, _E, _NOT_SET);
        assertSimpleMatch('constant.numeric.hex.baz', 3, 2 /* Bold */, _E, _NOT_SET);
        assertSimpleMatch('constant.numeric.oct', 3, 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, _E, _NOT_SET);
        assertSimpleMatch('constant.numeric.oct.baz', 3, 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, _E, _NOT_SET);
        assertSimpleMatch('constant.numeric.dec', 3, 0 /* None */, _F, _NOT_SET);
        assertSimpleMatch('constant.numeric.dec.baz', 3, 0 /* None */, _F, _NOT_SET);
        assertSimpleMatch('storage.object.bar', 3, 0 /* None */, _H, _NOT_SET);
        assertSimpleMatch('storage.object.bar.baz', 3, 0 /* None */, _H, _NOT_SET);
        assertSimpleMatch('storage.object.bart', 0, -1 /* NotSet */, _NOT_SET, _NOT_SET);
        assertSimpleMatch('storage.object', 0, -1 /* NotSet */, _NOT_SET, _NOT_SET);
        assertSimpleMatch('storage', 0, -1 /* NotSet */, _NOT_SET, _NOT_SET);
        assertMatch('bar', [new _theme.ThemeTrieElementRule(1, ['selector', 'source.css'], 2 /* Bold */, _NOT_SET, _C), new _theme.ThemeTrieElementRule(1, null, -1 /* NotSet */, _NOT_SET, _C)]);
    });
    it('Microsoft/vscode#23460', function () {
        var theme = _theme.Theme.createFromRawTheme({
            settings: [{
                settings: {
                    foreground: '#aec2e0',
                    background: '#14191f'
                }
            }, {
                name: 'JSON String',
                scope: 'meta.structure.dictionary.json string.quoted.double.json',
                settings: {
                    foreground: '#FF410D'
                }
            }, {
                scope: 'meta.structure.dictionary.json string.quoted.double.json',
                settings: {
                    foreground: '#ffffff'
                }
            }, {
                scope: 'meta.structure.dictionary.value.json string.quoted.double.json',
                settings: {
                    foreground: '#FF410D'
                }
            }]
        });
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#aec2e0');
        var _B = colorMap.getId('#14191f');
        var _C = colorMap.getId('#FF410D');
        var _D = colorMap.getId('#ffffff');
        function assertMatch(scopeName, expected) {
            var actual = theme.match(scopeName);
            assert.deepStrictEqual(actual, expected, 'when matching <<' + scopeName + '>>');
        }
        assertMatch('string.quoted.double.json', [new _theme.ThemeTrieElementRule(4, ['meta.structure.dictionary.value.json'], -1 /* NotSet */, _C, _NOT_SET), new _theme.ThemeTrieElementRule(4, ['meta.structure.dictionary.json'], -1 /* NotSet */, _D, _NOT_SET), new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)]);
        var parent3 = new _grammar.ScopeListElement(null, 'source.json', 0);
        var parent2 = new _grammar.ScopeListElement(parent3, 'meta.structure.dictionary.json', 0);
        var parent1 = new _grammar.ScopeListElement(parent2, 'meta.structure.dictionary.value.json', 0);
        var r = _grammar.ScopeListElement.mergeMetadata(0, parent1, new _grammar.ScopeMetadata('string.quoted.double.json', 0, 0, theme.match('string.quoted.double.json')));
        var colorMap2 = theme.getColorMap();
        assert.strictEqual(colorMap2[_grammar.StackElementMetadata.getForeground(r)], '#FF410D');
    });
});
describe('Theme parsing', function () {
    it('can parse', function () {
        var actual = (0, _theme.parseTheme)({
            settings: [{ settings: { foreground: '#F8F8F2', background: '#272822' } }, { scope: 'source, something', settings: { background: '#100000' } }, { scope: ['bar', 'baz'], settings: { background: '#010000' } }, { scope: 'source.css selector bar', settings: { fontStyle: 'bold' } }, { scope: 'constant', settings: { fontStyle: 'italic', foreground: '#ff0000' } }, { scope: 'constant.numeric', settings: { foreground: '#00ff00' } }, { scope: 'constant.numeric.hex', settings: { fontStyle: 'bold' } }, { scope: 'constant.numeric.oct', settings: { fontStyle: 'bold italic underline' } }, { scope: 'constant.numeric.dec', settings: { fontStyle: '', foreground: '#0000ff' } }, { scope: 'foo', settings: { fontStyle: '', foreground: '#CFA' } }]
        });
        var expected = [new _theme.ParsedThemeRule('', null, 0, -1 /* NotSet */, '#F8F8F2', '#272822'), new _theme.ParsedThemeRule('source', null, 1, -1 /* NotSet */, null, '#100000'), new _theme.ParsedThemeRule('something', null, 1, -1 /* NotSet */, null, '#100000'), new _theme.ParsedThemeRule('bar', null, 2, -1 /* NotSet */, null, '#010000'), new _theme.ParsedThemeRule('baz', null, 2, -1 /* NotSet */, null, '#010000'), new _theme.ParsedThemeRule('bar', ['selector', 'source.css'], 3, 2 /* Bold */, null, null), new _theme.ParsedThemeRule('constant', null, 4, 1 /* Italic */, '#ff0000', null), new _theme.ParsedThemeRule('constant.numeric', null, 5, -1 /* NotSet */, '#00ff00', null), new _theme.ParsedThemeRule('constant.numeric.hex', null, 6, 2 /* Bold */, null, null), new _theme.ParsedThemeRule('constant.numeric.oct', null, 7, 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, null, null), new _theme.ParsedThemeRule('constant.numeric.dec', null, 8, 0 /* None */, '#0000ff', null), new _theme.ParsedThemeRule('foo', null, 9, 0 /* None */, '#CFA', null)];
        assert.deepStrictEqual(actual, expected);
    });
});
describe('Theme resolving', function () {
    it('strcmp works', function () {
        var actual = ['bar', 'z', 'zu', 'a', 'ab', ''].sort(_theme.strcmp);
        var expected = ['', 'a', 'ab', 'bar', 'z', 'zu'];
        assert.deepStrictEqual(actual, expected);
    });
    it('strArrCmp works', function () {
        function assertStrArrCmp(testCase, a, b, expected) {
            assert.strictEqual((0, _theme.strArrCmp)(a, b), expected, testCase);
        }
        assertStrArrCmp('001', null, null, 0);
        assertStrArrCmp('002', null, [], -1);
        assertStrArrCmp('003', null, ['a'], -1);
        assertStrArrCmp('004', [], null, 1);
        assertStrArrCmp('005', ['a'], null, 1);
        assertStrArrCmp('006', [], [], 0);
        assertStrArrCmp('007', [], ['a'], -1);
        assertStrArrCmp('008', ['a'], [], 1);
        assertStrArrCmp('009', ['a'], ['a'], 0);
        assertStrArrCmp('010', ['a', 'b'], ['a'], 1);
        assertStrArrCmp('011', ['a'], ['a', 'b'], -1);
        assertStrArrCmp('012', ['a', 'b'], ['a', 'b'], 0);
        assertStrArrCmp('013', ['a', 'b'], ['a', 'c'], -1);
        assertStrArrCmp('014', ['a', 'c'], ['a', 'b'], 1);
    });
    it('always has defaults', function () {
        var actual = _theme.Theme.createFromParsedTheme([]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#000000');
        var _B = colorMap.getId('#ffffff');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('respects incoming defaults 1', function () {
        var actual = _theme.Theme.createFromParsedTheme([new _theme.ParsedThemeRule('', null, -1, -1 /* NotSet */, null, null)]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#000000');
        var _B = colorMap.getId('#ffffff');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('respects incoming defaults 2', function () {
        var actual = _theme.Theme.createFromParsedTheme([new _theme.ParsedThemeRule('', null, -1, 0 /* None */, null, null)]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#000000');
        var _B = colorMap.getId('#ffffff');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('respects incoming defaults 3', function () {
        var actual = _theme.Theme.createFromParsedTheme([new _theme.ParsedThemeRule('', null, -1, 2 /* Bold */, null, null)]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#000000');
        var _B = colorMap.getId('#ffffff');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 2 /* Bold */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('respects incoming defaults 4', function () {
        var actual = _theme.Theme.createFromParsedTheme([new _theme.ParsedThemeRule('', null, -1, -1 /* NotSet */, '#ff0000', null)]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#ff0000');
        var _B = colorMap.getId('#ffffff');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('respects incoming defaults 5', function () {
        var actual = _theme.Theme.createFromParsedTheme([new _theme.ParsedThemeRule('', null, -1, -1 /* NotSet */, null, '#ff0000')]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#000000');
        var _B = colorMap.getId('#ff0000');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('can merge incoming defaults', function () {
        var actual = _theme.Theme.createFromParsedTheme([new _theme.ParsedThemeRule('', null, -1, -1 /* NotSet */, null, '#ff0000'), new _theme.ParsedThemeRule('', null, -1, -1 /* NotSet */, '#00ff00', null), new _theme.ParsedThemeRule('', null, -1, 2 /* Bold */, null, null)]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#00ff00');
        var _B = colorMap.getId('#ff0000');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 2 /* Bold */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('defaults are inherited', function () {
        var actual = _theme.Theme.createFromParsedTheme([new _theme.ParsedThemeRule('', null, -1, -1 /* NotSet */, '#F8F8F2', '#272822'), new _theme.ParsedThemeRule('var', null, -1, -1 /* NotSet */, '#ff0000', null)]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#F8F8F2');
        var _B = colorMap.getId('#272822');
        var _C = colorMap.getId('#ff0000');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET), [], {
            'var': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(1, null, -1 /* NotSet */, _C, _NOT_SET))
        }));
        assert.deepStrictEqual(actual, expected);
    });
    it('same rules get merged', function () {
        var actual = _theme.Theme.createFromParsedTheme([new _theme.ParsedThemeRule('', null, -1, -1 /* NotSet */, '#F8F8F2', '#272822'), new _theme.ParsedThemeRule('var', null, 1, 2 /* Bold */, null, null), new _theme.ParsedThemeRule('var', null, 0, -1 /* NotSet */, '#ff0000', null)]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#F8F8F2');
        var _B = colorMap.getId('#272822');
        var _C = colorMap.getId('#ff0000');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET), [], {
            'var': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(1, null, 2 /* Bold */, _C, _NOT_SET))
        }));
        assert.deepStrictEqual(actual, expected);
    });
    it('rules are inherited 1', function () {
        var actual = _theme.Theme.createFromParsedTheme([new _theme.ParsedThemeRule('', null, -1, -1 /* NotSet */, '#F8F8F2', '#272822'), new _theme.ParsedThemeRule('var', null, -1, 2 /* Bold */, '#ff0000', null), new _theme.ParsedThemeRule('var.identifier', null, -1, -1 /* NotSet */, '#00ff00', null)]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#F8F8F2');
        var _B = colorMap.getId('#272822');
        var _C = colorMap.getId('#ff0000');
        var _D = colorMap.getId('#00ff00');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET), [], {
            'var': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(1, null, 2 /* Bold */, _C, _NOT_SET), [], {
                'identifier': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(2, null, 2 /* Bold */, _D, _NOT_SET))
            })
        }));
        assert.deepStrictEqual(actual, expected);
    });
    it('rules are inherited 2', function () {
        var actual = _theme.Theme.createFromParsedTheme([new _theme.ParsedThemeRule('', null, -1, -1 /* NotSet */, '#F8F8F2', '#272822'), new _theme.ParsedThemeRule('var', null, -1, 2 /* Bold */, '#ff0000', null), new _theme.ParsedThemeRule('var.identifier', null, -1, -1 /* NotSet */, '#00ff00', null), new _theme.ParsedThemeRule('constant', null, 4, 1 /* Italic */, '#100000', null), new _theme.ParsedThemeRule('constant.numeric', null, 5, -1 /* NotSet */, '#200000', null), new _theme.ParsedThemeRule('constant.numeric.hex', null, 6, 2 /* Bold */, null, null), new _theme.ParsedThemeRule('constant.numeric.oct', null, 7, 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, null, null), new _theme.ParsedThemeRule('constant.numeric.dec', null, 8, 0 /* None */, '#300000', null)]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#F8F8F2');
        var _B = colorMap.getId('#272822');
        var _C = colorMap.getId('#100000');
        var _D = colorMap.getId('#200000');
        var _E = colorMap.getId('#300000');
        var _F = colorMap.getId('#ff0000');
        var _G = colorMap.getId('#00ff00');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET), [], {
            'var': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(1, null, 2 /* Bold */, _F, _NOT_SET), [], {
                'identifier': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(2, null, 2 /* Bold */, _G, _NOT_SET))
            }),
            'constant': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(1, null, 1 /* Italic */, _C, _NOT_SET), [], {
                'numeric': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(2, null, 1 /* Italic */, _D, _NOT_SET), [], {
                    'hex': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(3, null, 2 /* Bold */, _D, _NOT_SET)),
                    'oct': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(3, null, 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, _D, _NOT_SET)),
                    'dec': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(3, null, 0 /* None */, _E, _NOT_SET))
                })
            })
        }));
        assert.deepStrictEqual(actual, expected);
    });
    it('rules with parent scopes', function () {
        var actual = _theme.Theme.createFromParsedTheme([new _theme.ParsedThemeRule('', null, -1, -1 /* NotSet */, '#F8F8F2', '#272822'), new _theme.ParsedThemeRule('var', null, -1, 2 /* Bold */, '#100000', null), new _theme.ParsedThemeRule('var.identifier', null, -1, -1 /* NotSet */, '#200000', null), new _theme.ParsedThemeRule('var', ['source.css'], 1, 1 /* Italic */, '#300000', null), new _theme.ParsedThemeRule('var', ['source.css'], 2, 4 /* Underline */, null, null)]);
        var colorMap = new _theme.ColorMap();
        var _NOT_SET = 0;
        var _A = colorMap.getId('#F8F8F2');
        var _B = colorMap.getId('#272822');
        var _C = colorMap.getId('#100000');
        var _D = colorMap.getId('#300000');
        var _E = colorMap.getId('#200000');
        var expected = new _theme.Theme(colorMap, new _theme.ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET), [], {
            'var': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(1, null, 2 /* Bold */, _C, 0), [new _theme.ThemeTrieElementRule(1, ['source.css'], 4 /* Underline */, _D, _NOT_SET)], {
                'identifier': new _theme.ThemeTrieElement(new _theme.ThemeTrieElementRule(2, null, 2 /* Bold */, _E, _NOT_SET), [new _theme.ThemeTrieElementRule(1, ['source.css'], 4 /* Underline */, _D, _NOT_SET)])
            })
        }));
        assert.deepStrictEqual(actual, expected);
    });
    it('issue #38: ignores rules with invalid colors', function () {
        var actual = (0, _theme.parseTheme)({
            settings: [{
                settings: {
                    background: '#222222',
                    foreground: '#cccccc'
                }
            }, {
                name: 'Variable',
                scope: 'variable',
                settings: {
                    fontStyle: ''
                }
            }, {
                name: 'Function argument',
                scope: 'variable.parameter',
                settings: {
                    fontStyle: 'italic',
                    foreground: ''
                }
            }, {
                name: 'Library variable',
                scope: 'support.other.variable',
                settings: {
                    fontStyle: ''
                }
            }, {
                name: 'Function argument',
                scope: 'variable.other',
                settings: {
                    foreground: '',
                    fontStyle: 'normal'
                }
            }, {
                name: 'Coffeescript Function argument',
                scope: 'variable.parameter.function.coffee',
                settings: {
                    foreground: '#F9D423',
                    fontStyle: 'italic'
                }
            }]
        });
        var expected = [new _theme.ParsedThemeRule('', null, 0, -1 /* NotSet */, '#cccccc', '#222222'), new _theme.ParsedThemeRule('variable', null, 1, 0 /* None */, null, null), new _theme.ParsedThemeRule('variable.parameter', null, 2, 1 /* Italic */, null, null), new _theme.ParsedThemeRule('support.other.variable', null, 3, 0 /* None */, null, null), new _theme.ParsedThemeRule('variable.other', null, 4, 0 /* None */, null, null), new _theme.ParsedThemeRule('variable.parameter.function.coffee', null, 5, 1 /* Italic */, '#F9D423', null)];
        assert.deepStrictEqual(actual, expected);
    });
    it('issue #35: Trailing comma in a tmTheme scope selector', function () {
        var actual = (0, _theme.parseTheme)({
            settings: [{
                settings: {
                    background: '#25292C',
                    foreground: '#EFEFEF'
                }
            }, {
                name: 'CSS at-rule keyword control',
                scope: ['meta.at-rule.return.scss,', 'meta.at-rule.return.scss punctuation.definition,', 'meta.at-rule.else.scss,', 'meta.at-rule.else.scss punctuation.definition,', 'meta.at-rule.if.scss,', 'meta.at-rule.if.scss punctuation.definition,'].join('\n'),
                settings: {
                    foreground: '#CC7832'
                }
            }]
        });
        var expected = [new _theme.ParsedThemeRule('', null, 0, -1 /* NotSet */, '#EFEFEF', '#25292C'), new _theme.ParsedThemeRule('meta.at-rule.return.scss', null, 1, -1 /* NotSet */, '#CC7832', null), new _theme.ParsedThemeRule('punctuation.definition', ['meta.at-rule.return.scss'], 1, -1 /* NotSet */, '#CC7832', null), new _theme.ParsedThemeRule('meta.at-rule.else.scss', null, 1, -1 /* NotSet */, '#CC7832', null), new _theme.ParsedThemeRule('punctuation.definition', ['meta.at-rule.else.scss'], 1, -1 /* NotSet */, '#CC7832', null), new _theme.ParsedThemeRule('meta.at-rule.if.scss', null, 1, -1 /* NotSet */, '#CC7832', null), new _theme.ParsedThemeRule('punctuation.definition', ['meta.at-rule.if.scss'], 1, -1 /* NotSet */, '#CC7832', null)];
        assert.deepStrictEqual(actual, expected);
    });
});