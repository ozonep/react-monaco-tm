'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import { Registry } from '../main';
import { ScopeListElement, ScopeMetadata, StackElementMetadata } from '../grammar';
import { Theme, strcmp, strArrCmp, ThemeTrieElement, ThemeTrieElementRule, parseTheme, ParsedThemeRule, ColorMap } from '../theme';
import { ThemeTest } from './themeTest';
import { getOnigasm, getOniguruma } from '../onigLibs';
import { Resolver } from './resolver';
const THEMES_TEST_PATH = path.join(__dirname, '../../test-cases/themes');
class ThemeInfo {
    constructor(themeName, filename, includeFilename) {
        this._themeName = themeName;
        this._filename = filename;
        this._includeFilename = includeFilename;
    }
    static _loadThemeFile(filename) {
        let fullPath = path.join(THEMES_TEST_PATH, filename);
        let fileContents = fs.readFileSync(fullPath).toString();
        if (/\.json$/.test(filename)) {
            return JSON.parse(fileContents);
        }
    }
    create(resolver) {
        let theme = ThemeInfo._loadThemeFile(this._filename);
        if (this._includeFilename) {
            let includeTheme = ThemeInfo._loadThemeFile(this._includeFilename);
            theme.settings = includeTheme.settings.concat(theme.settings);
        }
        let registry = new Registry(resolver);
        registry.setTheme(theme);
        return {
            themeName: this._themeName,
            theme: theme,
            registry: registry
        };
    }
}
(function () {
    let THEMES = [
        new ThemeInfo('abyss', 'Abyss.tmTheme'),
        new ThemeInfo('dark_vs', 'dark_vs.json'),
        new ThemeInfo('light_vs', 'light_vs.json'),
        new ThemeInfo('hc_black', 'hc_black.json'),
        new ThemeInfo('dark_plus', 'dark_plus.json', 'dark_vs.json'),
        new ThemeInfo('light_plus', 'light_plus.json', 'light_vs.json'),
        new ThemeInfo('kimbie_dark', 'Kimbie_dark.tmTheme'),
        new ThemeInfo('monokai', 'Monokai.tmTheme'),
        new ThemeInfo('monokai_dimmed', 'dimmed-monokai.tmTheme'),
        new ThemeInfo('quietlight', 'QuietLight.tmTheme'),
        new ThemeInfo('red', 'red.tmTheme'),
        new ThemeInfo('solarized_dark', 'Solarized-dark.tmTheme'),
        new ThemeInfo('solarized_light', 'Solarized-light.tmTheme'),
        new ThemeInfo('tomorrow_night_blue', 'Tomorrow-Night-Blue.tmTheme'),
    ];
    let _grammars = JSON.parse(fs.readFileSync(path.join(THEMES_TEST_PATH, 'grammars.json')).toString('utf8'));
    for (let grammar of _grammars) {
        grammar.path = path.join(THEMES_TEST_PATH, grammar.path);
    }
    let _languages = JSON.parse(fs.readFileSync(path.join(THEMES_TEST_PATH, 'languages.json')).toString('utf8'));
    let _resolvers = [new Resolver(_grammars, _languages, getOnigasm(), 'onigasm')];
    let _themeDatas = _resolvers.map(resolver => THEMES.map(theme => theme.create(resolver)));
    describe('Theme suite', async () => {
        let testFiles = fs.readdirSync(path.join(THEMES_TEST_PATH, 'tests'));
        testFiles = testFiles.filter(testFile => !/\.result$/.test(testFile));
        testFiles = testFiles.filter(testFile => !/\.result.patch$/.test(testFile));
        testFiles = testFiles.filter(testFile => !/\.actual$/.test(testFile));
        testFiles = testFiles.filter(testFile => !/\.diff.html$/.test(testFile));
        for (let testFile of testFiles) {
            for (let i = 0; i < _resolvers.length; i++) {
                let test = new ThemeTest(THEMES_TEST_PATH, testFile, _resolvers[i]);
                it(test.testName, () => {
                    return test.evaluate(_themeDatas[i]).then(_ => {
                        assert.ok(!test.hasDiff(), 'no more unpatched differences');
                    });
                }).timeout(20000);
            }
        }
    });
})();
describe('Theme matching', () => {
    it('gives higher priority to deeper matches', () => {
        let theme = Theme.createFromRawTheme({
            settings: [
                { settings: { foreground: '#100000', background: '#200000' } },
                { scope: 'punctuation.definition.string.begin.html', settings: { foreground: '#300000' } },
                { scope: 'meta.tag punctuation.definition.string', settings: { foreground: '#400000' } },
            ]
        });
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#100000');
        const _B = colorMap.getId('#200000');
        const _C = colorMap.getId('#400000');
        const _D = colorMap.getId('#300000');
        let actual = theme.match('punctuation.definition.string.begin.html');
        assert.deepStrictEqual(actual, [
            new ThemeTrieElementRule(5, null, -1 /* NotSet */, _D, _NOT_SET),
            new ThemeTrieElementRule(3, ['meta.tag'], -1 /* NotSet */, _C, _NOT_SET),
        ]);
    });
    it('gives higher priority to parent matches 1', () => {
        let theme = Theme.createFromRawTheme({
            settings: [
                { settings: { foreground: '#100000', background: '#200000' } },
                { scope: 'c a', settings: { foreground: '#300000' } },
                { scope: 'd a.b', settings: { foreground: '#400000' } },
                { scope: 'a', settings: { foreground: '#500000' } },
            ]
        });
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#100000');
        const _B = colorMap.getId('#200000');
        const _C = colorMap.getId('#500000');
        const _D = colorMap.getId('#300000');
        const _E = colorMap.getId('#400000');
        let actual = theme.match('a.b');
        assert.deepStrictEqual(actual, [
            new ThemeTrieElementRule(2, ['d'], -1 /* NotSet */, _E, _NOT_SET),
            new ThemeTrieElementRule(1, ['c'], -1 /* NotSet */, _D, _NOT_SET),
            new ThemeTrieElementRule(1, null, -1 /* NotSet */, _C, _NOT_SET),
        ]);
    });
    it('gives higher priority to parent matches 2', () => {
        let theme = Theme.createFromRawTheme({
            settings: [
                { settings: { foreground: '#100000', background: '#200000' } },
                { scope: 'meta.tag entity', settings: { foreground: '#300000' } },
                { scope: 'meta.selector.css entity.name.tag', settings: { foreground: '#400000' } },
                { scope: 'entity', settings: { foreground: '#500000' } },
            ]
        });
        let root = new ScopeListElement(null, 'text.html.cshtml', 0);
        let parent = new ScopeListElement(root, 'meta.tag.structure.any.html', 0);
        let r = ScopeListElement.mergeMetadata(0, parent, new ScopeMetadata('entity.name.tag.structure.any.html', 0, 0, theme.match('entity.name.tag.structure.any.html')));
        let colorMap = theme.getColorMap();
        assert.strictEqual(colorMap[StackElementMetadata.getForeground(r)], '#300000');
    });
    it('can match', () => {
        let theme = Theme.createFromRawTheme({
            settings: [
                { settings: { foreground: '#F8F8F2', background: '#272822' } },
                { scope: 'source, something', settings: { background: '#100000' } },
                { scope: ['bar', 'baz'], settings: { background: '#200000' } },
                { scope: 'source.css selector bar', settings: { fontStyle: 'bold' } },
                { scope: 'constant', settings: { fontStyle: 'italic', foreground: '#300000' } },
                { scope: 'constant.numeric', settings: { foreground: '#400000' } },
                { scope: 'constant.numeric.hex', settings: { fontStyle: 'bold' } },
                { scope: 'constant.numeric.oct', settings: { fontStyle: 'bold italic underline' } },
                { scope: 'constant.numeric.dec', settings: { fontStyle: '', foreground: '#500000' } },
                { scope: 'storage.object.bar', settings: { fontStyle: '', foreground: '#600000' } },
            ]
        });
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#F8F8F2');
        const _B = colorMap.getId('#272822');
        const _C = colorMap.getId('#200000');
        const _D = colorMap.getId('#300000');
        const _E = colorMap.getId('#400000');
        const _F = colorMap.getId('#500000');
        const _G = colorMap.getId('#100000');
        const _H = colorMap.getId('#600000');
        function assertMatch(scopeName, expected) {
            let actual = theme.match(scopeName);
            assert.deepStrictEqual(actual, expected, 'when matching <<' + scopeName + '>>');
        }
        function assertSimpleMatch(scopeName, scopeDepth, fontStyle, foreground, background) {
            assertMatch(scopeName, [
                new ThemeTrieElementRule(scopeDepth, null, fontStyle, foreground, background)
            ]);
        }
        function assertNoMatch(scopeName) {
            assertMatch(scopeName, [
                new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)
            ]);
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
        assertMatch('bar', [
            new ThemeTrieElementRule(1, ['selector', 'source.css'], 2 /* Bold */, _NOT_SET, _C),
            new ThemeTrieElementRule(1, null, -1 /* NotSet */, _NOT_SET, _C),
        ]);
    });
    it('Microsoft/vscode#23460', () => {
        let theme = Theme.createFromRawTheme({
            settings: [
                {
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
                },
                {
                    scope: 'meta.structure.dictionary.value.json string.quoted.double.json',
                    settings: {
                        foreground: '#FF410D'
                    }
                }
            ]
        });
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#aec2e0');
        const _B = colorMap.getId('#14191f');
        const _C = colorMap.getId('#FF410D');
        const _D = colorMap.getId('#ffffff');
        function assertMatch(scopeName, expected) {
            let actual = theme.match(scopeName);
            assert.deepStrictEqual(actual, expected, 'when matching <<' + scopeName + '>>');
        }
        assertMatch('string.quoted.double.json', [
            new ThemeTrieElementRule(4, ['meta.structure.dictionary.value.json'], -1 /* NotSet */, _C, _NOT_SET),
            new ThemeTrieElementRule(4, ['meta.structure.dictionary.json'], -1 /* NotSet */, _D, _NOT_SET),
            new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET),
        ]);
        let parent3 = new ScopeListElement(null, 'source.json', 0);
        let parent2 = new ScopeListElement(parent3, 'meta.structure.dictionary.json', 0);
        let parent1 = new ScopeListElement(parent2, 'meta.structure.dictionary.value.json', 0);
        let r = ScopeListElement.mergeMetadata(0, parent1, new ScopeMetadata('string.quoted.double.json', 0, 0, theme.match('string.quoted.double.json')));
        let colorMap2 = theme.getColorMap();
        assert.strictEqual(colorMap2[StackElementMetadata.getForeground(r)], '#FF410D');
    });
});
describe('Theme parsing', () => {
    it('can parse', () => {
        let actual = parseTheme({
            settings: [
                { settings: { foreground: '#F8F8F2', background: '#272822' } },
                { scope: 'source, something', settings: { background: '#100000' } },
                { scope: ['bar', 'baz'], settings: { background: '#010000' } },
                { scope: 'source.css selector bar', settings: { fontStyle: 'bold' } },
                { scope: 'constant', settings: { fontStyle: 'italic', foreground: '#ff0000' } },
                { scope: 'constant.numeric', settings: { foreground: '#00ff00' } },
                { scope: 'constant.numeric.hex', settings: { fontStyle: 'bold' } },
                { scope: 'constant.numeric.oct', settings: { fontStyle: 'bold italic underline' } },
                { scope: 'constant.numeric.dec', settings: { fontStyle: '', foreground: '#0000ff' } },
                { scope: 'foo', settings: { fontStyle: '', foreground: '#CFA' } },
            ]
        });
        let expected = [
            new ParsedThemeRule('', null, 0, -1 /* NotSet */, '#F8F8F2', '#272822'),
            new ParsedThemeRule('source', null, 1, -1 /* NotSet */, null, '#100000'),
            new ParsedThemeRule('something', null, 1, -1 /* NotSet */, null, '#100000'),
            new ParsedThemeRule('bar', null, 2, -1 /* NotSet */, null, '#010000'),
            new ParsedThemeRule('baz', null, 2, -1 /* NotSet */, null, '#010000'),
            new ParsedThemeRule('bar', ['selector', 'source.css'], 3, 2 /* Bold */, null, null),
            new ParsedThemeRule('constant', null, 4, 1 /* Italic */, '#ff0000', null),
            new ParsedThemeRule('constant.numeric', null, 5, -1 /* NotSet */, '#00ff00', null),
            new ParsedThemeRule('constant.numeric.hex', null, 6, 2 /* Bold */, null, null),
            new ParsedThemeRule('constant.numeric.oct', null, 7, 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, null, null),
            new ParsedThemeRule('constant.numeric.dec', null, 8, 0 /* None */, '#0000ff', null),
            new ParsedThemeRule('foo', null, 9, 0 /* None */, '#CFA', null),
        ];
        assert.deepStrictEqual(actual, expected);
    });
});
describe('Theme resolving', () => {
    it('strcmp works', () => {
        let actual = ['bar', 'z', 'zu', 'a', 'ab', ''].sort(strcmp);
        let expected = ['', 'a', 'ab', 'bar', 'z', 'zu'];
        assert.deepStrictEqual(actual, expected);
    });
    it('strArrCmp works', () => {
        function assertStrArrCmp(testCase, a, b, expected) {
            assert.strictEqual(strArrCmp(a, b), expected, testCase);
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
    it('always has defaults', () => {
        let actual = Theme.createFromParsedTheme([]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#000000');
        const _B = colorMap.getId('#ffffff');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('respects incoming defaults 1', () => {
        let actual = Theme.createFromParsedTheme([
            new ParsedThemeRule('', null, -1, -1 /* NotSet */, null, null)
        ]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#000000');
        const _B = colorMap.getId('#ffffff');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('respects incoming defaults 2', () => {
        let actual = Theme.createFromParsedTheme([
            new ParsedThemeRule('', null, -1, 0 /* None */, null, null)
        ]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#000000');
        const _B = colorMap.getId('#ffffff');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('respects incoming defaults 3', () => {
        let actual = Theme.createFromParsedTheme([
            new ParsedThemeRule('', null, -1, 2 /* Bold */, null, null)
        ]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#000000');
        const _B = colorMap.getId('#ffffff');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 2 /* Bold */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('respects incoming defaults 4', () => {
        let actual = Theme.createFromParsedTheme([
            new ParsedThemeRule('', null, -1, -1 /* NotSet */, '#ff0000', null)
        ]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#ff0000');
        const _B = colorMap.getId('#ffffff');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('respects incoming defaults 5', () => {
        let actual = Theme.createFromParsedTheme([
            new ParsedThemeRule('', null, -1, -1 /* NotSet */, null, '#ff0000')
        ]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#000000');
        const _B = colorMap.getId('#ff0000');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('can merge incoming defaults', () => {
        let actual = Theme.createFromParsedTheme([
            new ParsedThemeRule('', null, -1, -1 /* NotSet */, null, '#ff0000'),
            new ParsedThemeRule('', null, -1, -1 /* NotSet */, '#00ff00', null),
            new ParsedThemeRule('', null, -1, 2 /* Bold */, null, null),
        ]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#00ff00');
        const _B = colorMap.getId('#ff0000');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 2 /* Bold */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET)));
        assert.deepStrictEqual(actual, expected);
    });
    it('defaults are inherited', () => {
        let actual = Theme.createFromParsedTheme([
            new ParsedThemeRule('', null, -1, -1 /* NotSet */, '#F8F8F2', '#272822'),
            new ParsedThemeRule('var', null, -1, -1 /* NotSet */, '#ff0000', null)
        ]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#F8F8F2');
        const _B = colorMap.getId('#272822');
        const _C = colorMap.getId('#ff0000');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET), [], {
            'var': new ThemeTrieElement(new ThemeTrieElementRule(1, null, -1 /* NotSet */, _C, _NOT_SET))
        }));
        assert.deepStrictEqual(actual, expected);
    });
    it('same rules get merged', () => {
        let actual = Theme.createFromParsedTheme([
            new ParsedThemeRule('', null, -1, -1 /* NotSet */, '#F8F8F2', '#272822'),
            new ParsedThemeRule('var', null, 1, 2 /* Bold */, null, null),
            new ParsedThemeRule('var', null, 0, -1 /* NotSet */, '#ff0000', null),
        ]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#F8F8F2');
        const _B = colorMap.getId('#272822');
        const _C = colorMap.getId('#ff0000');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET), [], {
            'var': new ThemeTrieElement(new ThemeTrieElementRule(1, null, 2 /* Bold */, _C, _NOT_SET))
        }));
        assert.deepStrictEqual(actual, expected);
    });
    it('rules are inherited 1', () => {
        let actual = Theme.createFromParsedTheme([
            new ParsedThemeRule('', null, -1, -1 /* NotSet */, '#F8F8F2', '#272822'),
            new ParsedThemeRule('var', null, -1, 2 /* Bold */, '#ff0000', null),
            new ParsedThemeRule('var.identifier', null, -1, -1 /* NotSet */, '#00ff00', null),
        ]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#F8F8F2');
        const _B = colorMap.getId('#272822');
        const _C = colorMap.getId('#ff0000');
        const _D = colorMap.getId('#00ff00');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET), [], {
            'var': new ThemeTrieElement(new ThemeTrieElementRule(1, null, 2 /* Bold */, _C, _NOT_SET), [], {
                'identifier': new ThemeTrieElement(new ThemeTrieElementRule(2, null, 2 /* Bold */, _D, _NOT_SET))
            })
        }));
        assert.deepStrictEqual(actual, expected);
    });
    it('rules are inherited 2', () => {
        let actual = Theme.createFromParsedTheme([
            new ParsedThemeRule('', null, -1, -1 /* NotSet */, '#F8F8F2', '#272822'),
            new ParsedThemeRule('var', null, -1, 2 /* Bold */, '#ff0000', null),
            new ParsedThemeRule('var.identifier', null, -1, -1 /* NotSet */, '#00ff00', null),
            new ParsedThemeRule('constant', null, 4, 1 /* Italic */, '#100000', null),
            new ParsedThemeRule('constant.numeric', null, 5, -1 /* NotSet */, '#200000', null),
            new ParsedThemeRule('constant.numeric.hex', null, 6, 2 /* Bold */, null, null),
            new ParsedThemeRule('constant.numeric.oct', null, 7, 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, null, null),
            new ParsedThemeRule('constant.numeric.dec', null, 8, 0 /* None */, '#300000', null),
        ]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#F8F8F2');
        const _B = colorMap.getId('#272822');
        const _C = colorMap.getId('#100000');
        const _D = colorMap.getId('#200000');
        const _E = colorMap.getId('#300000');
        const _F = colorMap.getId('#ff0000');
        const _G = colorMap.getId('#00ff00');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET), [], {
            'var': new ThemeTrieElement(new ThemeTrieElementRule(1, null, 2 /* Bold */, _F, _NOT_SET), [], {
                'identifier': new ThemeTrieElement(new ThemeTrieElementRule(2, null, 2 /* Bold */, _G, _NOT_SET))
            }),
            'constant': new ThemeTrieElement(new ThemeTrieElementRule(1, null, 1 /* Italic */, _C, _NOT_SET), [], {
                'numeric': new ThemeTrieElement(new ThemeTrieElementRule(2, null, 1 /* Italic */, _D, _NOT_SET), [], {
                    'hex': new ThemeTrieElement(new ThemeTrieElementRule(3, null, 2 /* Bold */, _D, _NOT_SET)),
                    'oct': new ThemeTrieElement(new ThemeTrieElementRule(3, null, 2 /* Bold */ | 1 /* Italic */ | 4 /* Underline */, _D, _NOT_SET)),
                    'dec': new ThemeTrieElement(new ThemeTrieElementRule(3, null, 0 /* None */, _E, _NOT_SET)),
                })
            })
        }));
        assert.deepStrictEqual(actual, expected);
    });
    it('rules with parent scopes', () => {
        let actual = Theme.createFromParsedTheme([
            new ParsedThemeRule('', null, -1, -1 /* NotSet */, '#F8F8F2', '#272822'),
            new ParsedThemeRule('var', null, -1, 2 /* Bold */, '#100000', null),
            new ParsedThemeRule('var.identifier', null, -1, -1 /* NotSet */, '#200000', null),
            new ParsedThemeRule('var', ['source.css'], 1, 1 /* Italic */, '#300000', null),
            new ParsedThemeRule('var', ['source.css'], 2, 4 /* Underline */, null, null),
        ]);
        let colorMap = new ColorMap();
        const _NOT_SET = 0;
        const _A = colorMap.getId('#F8F8F2');
        const _B = colorMap.getId('#272822');
        const _C = colorMap.getId('#100000');
        const _D = colorMap.getId('#300000');
        const _E = colorMap.getId('#200000');
        let expected = new Theme(colorMap, new ThemeTrieElementRule(0, null, 0 /* None */, _A, _B), new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, _NOT_SET, _NOT_SET), [], {
            'var': new ThemeTrieElement(new ThemeTrieElementRule(1, null, 2 /* Bold */, _C, 0), [new ThemeTrieElementRule(1, ['source.css'], 4 /* Underline */, _D, _NOT_SET)], {
                'identifier': new ThemeTrieElement(new ThemeTrieElementRule(2, null, 2 /* Bold */, _E, _NOT_SET), [new ThemeTrieElementRule(1, ['source.css'], 4 /* Underline */, _D, _NOT_SET)])
            })
        }));
        assert.deepStrictEqual(actual, expected);
    });
    it('issue #38: ignores rules with invalid colors', () => {
        let actual = parseTheme({
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
        let expected = [
            new ParsedThemeRule('', null, 0, -1 /* NotSet */, '#cccccc', '#222222'),
            new ParsedThemeRule('variable', null, 1, 0 /* None */, null, null),
            new ParsedThemeRule('variable.parameter', null, 2, 1 /* Italic */, null, null),
            new ParsedThemeRule('support.other.variable', null, 3, 0 /* None */, null, null),
            new ParsedThemeRule('variable.other', null, 4, 0 /* None */, null, null),
            new ParsedThemeRule('variable.parameter.function.coffee', null, 5, 1 /* Italic */, '#F9D423', null),
        ];
        assert.deepStrictEqual(actual, expected);
    });
    it('issue #35: Trailing comma in a tmTheme scope selector', () => {
        let actual = parseTheme({
            settings: [{
                    settings: {
                        background: '#25292C',
                        foreground: '#EFEFEF'
                    }
                }, {
                    name: 'CSS at-rule keyword control',
                    scope: [
                        'meta.at-rule.return.scss,',
                        'meta.at-rule.return.scss punctuation.definition,',
                        'meta.at-rule.else.scss,',
                        'meta.at-rule.else.scss punctuation.definition,',
                        'meta.at-rule.if.scss,',
                        'meta.at-rule.if.scss punctuation.definition,'
                    ].join('\n'),
                    settings: {
                        foreground: '#CC7832'
                    }
                }]
        });
        let expected = [
            new ParsedThemeRule('', null, 0, -1 /* NotSet */, '#EFEFEF', '#25292C'),
            new ParsedThemeRule('meta.at-rule.return.scss', null, 1, -1 /* NotSet */, '#CC7832', null),
            new ParsedThemeRule('punctuation.definition', ['meta.at-rule.return.scss'], 1, -1 /* NotSet */, '#CC7832', null),
            new ParsedThemeRule('meta.at-rule.else.scss', null, 1, -1 /* NotSet */, '#CC7832', null),
            new ParsedThemeRule('punctuation.definition', ['meta.at-rule.else.scss'], 1, -1 /* NotSet */, '#CC7832', null),
            new ParsedThemeRule('meta.at-rule.if.scss', null, 1, -1 /* NotSet */, '#CC7832', null),
            new ParsedThemeRule('punctuation.definition', ['meta.at-rule.if.scss'], 1, -1 /* NotSet */, '#CC7832', null),
        ];
        assert.deepStrictEqual(actual, expected);
    });
});
