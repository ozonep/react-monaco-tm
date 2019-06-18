// 'use strict';
// import * as fs from 'fs';
// import * as path from 'path';
// import { tokenizeWithTheme } from './themedTokenizer';
// export class ThemeTest {
//     static _readFile(filename) {
//         try {
//             return fs.readFileSync(filename).toString('utf8');
//         }
//         catch (err) {
//             return null;
//         }
//     }
//     static _readJSONFile(filename) {
//         try {
//             return JSON.parse(this._readFile(filename));
//         }
//         catch (err) {
//             return null;
//         }
//     }
//     constructor(THEMES_TEST_PATH, testFile, resolver) {
//         this.THEMES_TEST_PATH = THEMES_TEST_PATH;
//         const TEST_FILE_PATH = path.join(THEMES_TEST_PATH, 'tests', testFile);
//         const testFileContents = ThemeTest._readFile(TEST_FILE_PATH);
//         const EXPECTED_FILE_PATH = path.join(THEMES_TEST_PATH, 'tests', testFile + '.result');
//         const testFileExpected = ThemeTest._readJSONFile(EXPECTED_FILE_PATH);
//         const EXPECTED_PATCH_FILE_PATH = path.join(THEMES_TEST_PATH, 'tests', testFile + '.result.patch');
//         const testFileExpectedPatch = ThemeTest._readJSONFile(EXPECTED_PATCH_FILE_PATH);
//         let language = resolver.findLanguageByExtension(path.extname(testFile)) || resolver.findLanguageByFilename(testFile);
//         if (!language) {
//             throw new Error('Could not determine language for ' + testFile);
//         }
//         let grammar = resolver.findGrammarByLanguage(language);
//         let embeddedLanguages = Object.create(null);
//         if (grammar.embeddedLanguages) {
//             for (let scopeName in grammar.embeddedLanguages) {
//                 embeddedLanguages[scopeName] = resolver.language2id[grammar.embeddedLanguages[scopeName]];
//             }
//         }
//         this.tests = [];
//         for (let themeName in testFileExpected) {
//             this.tests.push(new SingleThemeTest(themeName, testFile, testFileContents, grammar.scopeName, resolver.language2id[language], embeddedLanguages, testFileExpected[themeName], testFileExpectedPatch ? testFileExpectedPatch[themeName] : []));
//         }
//         this.testName = testFile + '-' + resolver.getOnigLibName();
//     }
//     evaluate(themeDatas) {
//         let testsMap = {};
//         for (let i = 0; i < this.tests.length; i++) {
//             testsMap[this.tests[i].themeName] = this.tests[i];
//         }
//         return Promise.all(themeDatas.map(data => testsMap[data.themeName].evaluate(data)));
//     }
//     _getDiffPageData() {
//         return this.tests.map(t => t.getDiffPageData());
//     }
//     hasDiff() {
//         for (let i = 0; i < this.tests.length; i++) {
//             let test = this.tests[i];
//             if (test.patchedDiff && test.patchedDiff.length > 0) {
//                 return true;
//             }
//         }
//         return false;
//     }
//     writeDiffPage() {
//         let r = `<html><head>`;
//         r += `\n<link rel="stylesheet" type="text/css" href="../diff.css"/>`;
//         r += `\n<meta charset="utf-8">`;
//         r += `\n</head><body>`;
//         r += `\n<script>var allData = "${new Buffer(JSON.stringify(this._getDiffPageData())).toString('base64')}";</script>`;
//         r += `\n<script type="text/javascript" src="../diff.js"></script>`;
//         r += `\n</body></html>`;
//         fs.writeFileSync(path.join(this.THEMES_TEST_PATH, 'tests', this.testName + '.diff.html'), r);
//     }
// }
// class SingleThemeTest {
//     constructor(themeName, testName, contents, initialScopeName, initialLanguage, embeddedLanguages, expected, expectedPatch) {
//         this.themeName = themeName;
//         this.testName = testName;
//         this.contents = contents;
//         this.initialScopeName = initialScopeName;
//         this.initialLanguage = initialLanguage;
//         this.embeddedLanguages = embeddedLanguages;
//         this.expected = expected;
//         this.expectedPatch = expectedPatch;
//         this.patchedExpected = [];
//         let patchIndex = this.expectedPatch.length - 1;
//         for (let i = this.expected.length - 1; i >= 0; i--) {
//             let expectedElement = this.expected[i];
//             let content = expectedElement.content;
//             while (patchIndex >= 0 && i === this.expectedPatch[patchIndex].index) {
//                 let patch = this.expectedPatch[patchIndex];
//                 let patchContentIndex = content.lastIndexOf(patch.content);
//                 let afterContent = content.substr(patchContentIndex + patch.content.length);
//                 if (afterContent.length > 0) {
//                     this.patchedExpected.unshift({
//                         _r: expectedElement._r,
//                         _t: expectedElement._t,
//                         content: afterContent,
//                         color: expectedElement.color
//                     });
//                 }
//                 this.patchedExpected.unshift({
//                     _r: expectedElement._r,
//                     _t: expectedElement._t,
//                     content: patch.content,
//                     color: patch.newColor
//                 });
//                 content = content.substr(0, patchContentIndex);
//                 patchIndex--;
//             }
//             if (content.length > 0) {
//                 this.patchedExpected.unshift({
//                     _r: expectedElement._r,
//                     _t: expectedElement._t,
//                     content: content,
//                     color: expectedElement.color
//                 });
//             }
//         }
//         this.backgroundColor = null;
//         this.actual = null;
//         this.diff = null;
//         this.patchedDiff = null;
//     }
//     evaluate(themeData) {
//         this.backgroundColor = themeData.theme.settings[0].settings.background;
//         return this._tokenizeWithThemeAsync(themeData).then(res => {
//             this.actual = res;
//             this.diff = SingleThemeTest.computeThemeTokenizationDiff(this.actual, this.expected);
//             this.patchedDiff = SingleThemeTest.computeThemeTokenizationDiff(this.actual, this.patchedExpected);
//         });
//     }
//     getDiffPageData() {
//         return {
//             testContent: this.contents,
//             themeName: this.themeName,
//             backgroundColor: this.backgroundColor,
//             actual: this.actual,
//             expected: this.expected,
//             diff: this.diff,
//             patchedExpected: this.patchedExpected,
//             patchedDiff: this.patchedDiff
//         };
//     }
//     _tokenizeWithThemeAsync(themeData) {
//         return themeData.registry.loadGrammarWithEmbeddedLanguages(this.initialScopeName, this.initialLanguage, this.embeddedLanguages).then(grammar => {
//             return tokenizeWithTheme(themeData.theme, themeData.registry.getColorMap(), this.contents, grammar);
//         });
//     }
//     static computeThemeTokenizationDiff(_actual, _expected) {
//         let canonicalTokens = [];
//         for (let i = 0, len = _actual.length; i < len; i++) {
//             let explanation = _actual[i].explanation;
//             for (let j = 0, lenJ = explanation.length; j < lenJ; j++) {
//                 canonicalTokens.push(explanation[j].content);
//             }
//         }
//         let actual = [];
//         for (let i = 0, len = _actual.length; i < len; i++) {
//             let item = _actual[i];
//             for (let j = 0, lenJ = item.explanation.length; j < lenJ; j++) {
//                 actual.push({
//                     content: item.explanation[j].content,
//                     color: item.color,
//                     scopes: item.explanation[j].scopes
//                 });
//             }
//         }
//         let expected = [];
//         for (let i = 0, len = _expected.length, canonicalIndex = 0; i < len; i++) {
//             let item = _expected[i];
//             let content = item.content;
//             while (content.length > 0) {
//                 expected.push({
//                     oldIndex: i,
//                     content: canonicalTokens[canonicalIndex],
//                     color: item.color,
//                     _t: item._t,
//                     _r: item._r
//                 });
//                 content = content.substr(canonicalTokens[canonicalIndex].length);
//                 canonicalIndex++;
//             }
//         }
//         if (actual.length !== expected.length) {
//             throw new Error('Content mismatch');
//         }
//         let diffs = [];
//         for (let i = 0, len = actual.length; i < len; i++) {
//             let expectedItem = expected[i];
//             let actualItem = actual[i];
//             let contentIsInvisible = /^\s+$/.test(expectedItem.content);
//             if (contentIsInvisible) {
//                 continue;
//             }
//             if (actualItem.color.substr(0, 7) !== expectedItem.color) {
//                 diffs.push({
//                     oldIndex: expectedItem.oldIndex,
//                     oldToken: expectedItem,
//                     newToken: actualItem
//                 });
//             }
//         }
//         return diffs;
//     }
// }
