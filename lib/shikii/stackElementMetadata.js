"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StackElementMetadata = exports.StackElementMetadata = function () {
    function StackElementMetadata() {
        _classCallCheck(this, StackElementMetadata);
    }

    _createClass(StackElementMetadata, null, [{
        key: "toBinaryStr",
        value: function toBinaryStr(metadata) {
            var r = metadata.toString(2);
            while (r.length < 32) {
                r = '0' + r;
            }
            return r;
        }
    }, {
        key: "printMetadata",
        value: function printMetadata(metadata) {
            var languageId = StackElementMetadata.getLanguageId(metadata);
            var tokenType = StackElementMetadata.getTokenType(metadata);
            var fontStyle = StackElementMetadata.getFontStyle(metadata);
            var foreground = StackElementMetadata.getForeground(metadata);
            var background = StackElementMetadata.getBackground(metadata);
            console.log({
                languageId: languageId,
                tokenType: tokenType,
                fontStyle: fontStyle,
                foreground: foreground,
                background: background
            });
        }
    }, {
        key: "getLanguageId",
        value: function getLanguageId(metadata) {
            return (metadata & 255) >>> 0;
        }
    }, {
        key: "getTokenType",
        value: function getTokenType(metadata) {
            return (metadata & 1792) >>> 8;
        }
    }, {
        key: "getFontStyle",
        value: function getFontStyle(metadata) {
            return (metadata & 14336) >>> 11;
        }
    }, {
        key: "getForeground",
        value: function getForeground(metadata) {
            return (metadata & 8372224) >>> 14;
        }
    }, {
        key: "getBackground",
        value: function getBackground(metadata) {
            return (metadata & 4286578688) >>> 23;
        }
    }, {
        key: "set",
        value: function set(metadata, languageId, tokenType, fontStyle, foreground, background) {
            var _languageId = StackElementMetadata.getLanguageId(metadata);
            var _tokenType = StackElementMetadata.getTokenType(metadata);
            var _fontStyle = StackElementMetadata.getFontStyle(metadata);
            var _foreground = StackElementMetadata.getForeground(metadata);
            var _background = StackElementMetadata.getBackground(metadata);
            if (languageId !== 0) {
                _languageId = languageId;
            }
            if (tokenType !== 0) {
                _tokenType = tokenType === 8 ? 0 : tokenType;
            }
            if (fontStyle !== -1) {
                _fontStyle = fontStyle;
            }
            if (foreground !== 0) {
                _foreground = foreground;
            }
            if (background !== 0) {
                _background = background;
            }
            return (_languageId << 0 | _tokenType << 8 | _fontStyle << 11 | _foreground << 14 | _background << 23) >>> 0;
        }
    }]);

    return StackElementMetadata;
}();