"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.loadTheme = loadTheme;

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _json = require('json5');

var _json2 = _interopRequireDefault(_json);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function loadJSONTheme(themePath) {
    var fileContents = fs.readFileSync(themePath, 'utf-8');
    return _json2.default.parse(fileContents);
}

function toShikiTheme(rawTheme) {
    var shikiTheme = _extends({}, rawTheme, {
        bg: getThemeBg(rawTheme)
    });
    shikiTheme.settings = rawTheme.tokenColors;
    return shikiTheme;
}

function loadTheme(themePath) {
    var theme = loadJSONTheme(themePath);
    return toShikiTheme(theme);
}

function getThemeBg(theme) {
    if (theme.colors && theme.colors['editor.background']) {
        return theme.colors['editor.background'];
    }
}