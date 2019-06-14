'use strict';

var _assert = require('assert');

var assert = _interopRequireWildcard(_assert);

var _grammar = require('../grammar');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('StackElementMetadata', function () {
    function assertEquals(metadata, languageId, tokenType, fontStyle, foreground, background) {
        var actual = {
            languageId: _grammar.StackElementMetadata.getLanguageId(metadata),
            tokenType: _grammar.StackElementMetadata.getTokenType(metadata),
            fontStyle: _grammar.StackElementMetadata.getFontStyle(metadata),
            foreground: _grammar.StackElementMetadata.getForeground(metadata),
            background: _grammar.StackElementMetadata.getBackground(metadata)
        };
        var expected = {
            languageId: languageId,
            tokenType: tokenType,
            fontStyle: fontStyle,
            foreground: foreground,
            background: background
        };
        assert.deepStrictEqual(actual, expected, 'equals for ' + _grammar.StackElementMetadata.toBinaryStr(metadata));
    }
    it('works', function () {
        var value = _grammar.StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
        assertEquals(value, 1, 4, 4 | 2, 101, 102);
    });
    it('can overwrite languageId', function () {
        var value = _grammar.StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
        assertEquals(value, 1, 4, 4 | 2, 101, 102);
        value = _grammar.StackElementMetadata.set(value, 2, 0, -1, 0, 0);
        assertEquals(value, 2, 4, 4 | 2, 101, 102);
    });
    it('can overwrite tokenType', function () {
        var value = _grammar.StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
        assertEquals(value, 1, 4, 4 | 2, 101, 102);
        value = _grammar.StackElementMetadata.set(value, 0, 1, -1, 0, 0);
        assertEquals(value, 1, 1, 4 | 2, 101, 102);
    });
    it('can overwrite font style', function () {
        var value = _grammar.StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
        assertEquals(value, 1, 4, 4 | 2, 101, 102);
        value = _grammar.StackElementMetadata.set(value, 0, 0, 0, 0, 0);
        assertEquals(value, 1, 4, 0, 101, 102);
    });
    it('can overwrite foreground', function () {
        var value = _grammar.StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
        assertEquals(value, 1, 4, 4 | 2, 101, 102);
        value = _grammar.StackElementMetadata.set(value, 0, 0, -1, 5, 0);
        assertEquals(value, 1, 4, 4 | 2, 5, 102);
    });
    it('can overwrite background', function () {
        var value = _grammar.StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
        assertEquals(value, 1, 4, 4 | 2, 101, 102);
        value = _grammar.StackElementMetadata.set(value, 0, 0, -1, 0, 7);
        assertEquals(value, 1, 4, 4 | 2, 101, 7);
    });
    it('can work at max values', function () {
        var maxLangId = 255;
        var maxTokenType = 1 | 0 | 4 | 2;
        var maxFontStyle = 2 | 1 | 4;
        var maxForeground = 511;
        var maxBackground = 511;
        var value = _grammar.StackElementMetadata.set(0, maxLangId, maxTokenType, maxFontStyle, maxForeground, maxBackground);
        assertEquals(value, maxLangId, maxTokenType, maxFontStyle, maxForeground, maxBackground);
    });
});