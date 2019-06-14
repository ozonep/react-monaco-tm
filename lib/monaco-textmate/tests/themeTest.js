'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ThemeTest = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _themedTokenizer = require('./themedTokenizer');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ThemeTest = exports.ThemeTest = function () {
    _createClass(ThemeTest, null, [{
        key: '_readFile',
        value: function _readFile(filename) {
            try {
                return fs.readFileSync(filename).toString('utf8');
            } catch (err) {
                return null;
            }
        }
    }, {
        key: '_readJSONFile',
        value: function _readJSONFile(filename) {
            try {
                return JSON.parse(this._readFile(filename));
            } catch (err) {
                return null;
            }
        }
    }]);

    function ThemeTest(THEMES_TEST_PATH, testFile, resolver) {
        _classCallCheck(this, ThemeTest);

        this.THEMES_TEST_PATH = THEMES_TEST_PATH;
        var TEST_FILE_PATH = path.join(THEMES_TEST_PATH, 'tests', testFile);
        var testFileContents = ThemeTest._readFile(TEST_FILE_PATH);
        var EXPECTED_FILE_PATH = path.join(THEMES_TEST_PATH, 'tests', testFile + '.result');
        var testFileExpected = ThemeTest._readJSONFile(EXPECTED_FILE_PATH);
        var EXPECTED_PATCH_FILE_PATH = path.join(THEMES_TEST_PATH, 'tests', testFile + '.result.patch');
        var testFileExpectedPatch = ThemeTest._readJSONFile(EXPECTED_PATCH_FILE_PATH);
        var language = resolver.findLanguageByExtension(path.extname(testFile)) || resolver.findLanguageByFilename(testFile);
        if (!language) {
            throw new Error('Could not determine language for ' + testFile);
        }
        var grammar = resolver.findGrammarByLanguage(language);
        var embeddedLanguages = Object.create(null);
        if (grammar.embeddedLanguages) {
            for (var scopeName in grammar.embeddedLanguages) {
                embeddedLanguages[scopeName] = resolver.language2id[grammar.embeddedLanguages[scopeName]];
            }
        }
        this.tests = [];
        for (var themeName in testFileExpected) {
            this.tests.push(new SingleThemeTest(themeName, testFile, testFileContents, grammar.scopeName, resolver.language2id[language], embeddedLanguages, testFileExpected[themeName], testFileExpectedPatch ? testFileExpectedPatch[themeName] : []));
        }
        this.testName = testFile + '-' + resolver.getOnigLibName();
    }

    _createClass(ThemeTest, [{
        key: 'evaluate',
        value: function evaluate(themeDatas) {
            var testsMap = {};
            for (var i = 0; i < this.tests.length; i++) {
                testsMap[this.tests[i].themeName] = this.tests[i];
            }
            return Promise.all(themeDatas.map(function (data) {
                return testsMap[data.themeName].evaluate(data);
            }));
        }
    }, {
        key: '_getDiffPageData',
        value: function _getDiffPageData() {
            return this.tests.map(function (t) {
                return t.getDiffPageData();
            });
        }
    }, {
        key: 'hasDiff',
        value: function hasDiff() {
            for (var i = 0; i < this.tests.length; i++) {
                var test = this.tests[i];
                if (test.patchedDiff && test.patchedDiff.length > 0) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: 'writeDiffPage',
        value: function writeDiffPage() {
            var r = '<html><head>';
            r += '\n<link rel="stylesheet" type="text/css" href="../diff.css"/>';
            r += '\n<meta charset="utf-8">';
            r += '\n</head><body>';
            r += '\n<script>var allData = "' + new Buffer(JSON.stringify(this._getDiffPageData())).toString('base64') + '";</script>';
            r += '\n<script type="text/javascript" src="../diff.js"></script>';
            r += '\n</body></html>';
            fs.writeFileSync(path.join(this.THEMES_TEST_PATH, 'tests', this.testName + '.diff.html'), r);
        }
    }]);

    return ThemeTest;
}();

var SingleThemeTest = function () {
    function SingleThemeTest(themeName, testName, contents, initialScopeName, initialLanguage, embeddedLanguages, expected, expectedPatch) {
        _classCallCheck(this, SingleThemeTest);

        this.themeName = themeName;
        this.testName = testName;
        this.contents = contents;
        this.initialScopeName = initialScopeName;
        this.initialLanguage = initialLanguage;
        this.embeddedLanguages = embeddedLanguages;
        this.expected = expected;
        this.expectedPatch = expectedPatch;
        this.patchedExpected = [];
        var patchIndex = this.expectedPatch.length - 1;
        for (var i = this.expected.length - 1; i >= 0; i--) {
            var expectedElement = this.expected[i];
            var content = expectedElement.content;
            while (patchIndex >= 0 && i === this.expectedPatch[patchIndex].index) {
                var patch = this.expectedPatch[patchIndex];
                var patchContentIndex = content.lastIndexOf(patch.content);
                var afterContent = content.substr(patchContentIndex + patch.content.length);
                if (afterContent.length > 0) {
                    this.patchedExpected.unshift({
                        _r: expectedElement._r,
                        _t: expectedElement._t,
                        content: afterContent,
                        color: expectedElement.color
                    });
                }
                this.patchedExpected.unshift({
                    _r: expectedElement._r,
                    _t: expectedElement._t,
                    content: patch.content,
                    color: patch.newColor
                });
                content = content.substr(0, patchContentIndex);
                patchIndex--;
            }
            if (content.length > 0) {
                this.patchedExpected.unshift({
                    _r: expectedElement._r,
                    _t: expectedElement._t,
                    content: content,
                    color: expectedElement.color
                });
            }
        }
        this.backgroundColor = null;
        this.actual = null;
        this.diff = null;
        this.patchedDiff = null;
    }

    _createClass(SingleThemeTest, [{
        key: 'evaluate',
        value: function evaluate(themeData) {
            var _this = this;

            this.backgroundColor = themeData.theme.settings[0].settings.background;
            return this._tokenizeWithThemeAsync(themeData).then(function (res) {
                _this.actual = res;
                _this.diff = SingleThemeTest.computeThemeTokenizationDiff(_this.actual, _this.expected);
                _this.patchedDiff = SingleThemeTest.computeThemeTokenizationDiff(_this.actual, _this.patchedExpected);
            });
        }
    }, {
        key: 'getDiffPageData',
        value: function getDiffPageData() {
            return {
                testContent: this.contents,
                themeName: this.themeName,
                backgroundColor: this.backgroundColor,
                actual: this.actual,
                expected: this.expected,
                diff: this.diff,
                patchedExpected: this.patchedExpected,
                patchedDiff: this.patchedDiff
            };
        }
    }, {
        key: '_tokenizeWithThemeAsync',
        value: function _tokenizeWithThemeAsync(themeData) {
            var _this2 = this;

            return themeData.registry.loadGrammarWithEmbeddedLanguages(this.initialScopeName, this.initialLanguage, this.embeddedLanguages).then(function (grammar) {
                return (0, _themedTokenizer.tokenizeWithTheme)(themeData.theme, themeData.registry.getColorMap(), _this2.contents, grammar);
            });
        }
    }], [{
        key: 'computeThemeTokenizationDiff',
        value: function computeThemeTokenizationDiff(_actual, _expected) {
            var canonicalTokens = [];
            for (var i = 0, len = _actual.length; i < len; i++) {
                var explanation = _actual[i].explanation;
                for (var j = 0, lenJ = explanation.length; j < lenJ; j++) {
                    canonicalTokens.push(explanation[j].content);
                }
            }
            var actual = [];
            for (var _i = 0, _len = _actual.length; _i < _len; _i++) {
                var item = _actual[_i];
                for (var _j = 0, _lenJ = item.explanation.length; _j < _lenJ; _j++) {
                    actual.push({
                        content: item.explanation[_j].content,
                        color: item.color,
                        scopes: item.explanation[_j].scopes
                    });
                }
            }
            var expected = [];
            for (var _i2 = 0, _len2 = _expected.length, canonicalIndex = 0; _i2 < _len2; _i2++) {
                var _item = _expected[_i2];
                var content = _item.content;
                while (content.length > 0) {
                    expected.push({
                        oldIndex: _i2,
                        content: canonicalTokens[canonicalIndex],
                        color: _item.color,
                        _t: _item._t,
                        _r: _item._r
                    });
                    content = content.substr(canonicalTokens[canonicalIndex].length);
                    canonicalIndex++;
                }
            }
            if (actual.length !== expected.length) {
                throw new Error('Content mismatch');
            }
            var diffs = [];
            for (var _i3 = 0, _len3 = actual.length; _i3 < _len3; _i3++) {
                var expectedItem = expected[_i3];
                var actualItem = actual[_i3];
                var contentIsInvisible = /^\s+$/.test(expectedItem.content);
                if (contentIsInvisible) {
                    continue;
                }
                if (actualItem.color.substr(0, 7) !== expectedItem.color) {
                    diffs.push({
                        oldIndex: expectedItem.oldIndex,
                        oldToken: expectedItem,
                        newToken: actualItem
                    });
                }
            }
            return diffs;
        }
    }]);

    return SingleThemeTest;
}();