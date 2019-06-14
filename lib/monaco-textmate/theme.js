"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.parseTheme = parseTheme;
exports.strcmp = strcmp;
exports.strArrCmp = strArrCmp;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ParsedThemeRule = exports.ParsedThemeRule = function ParsedThemeRule(scope, parentScopes, index, fontStyle, foreground, background) {
    _classCallCheck(this, ParsedThemeRule);

    this.scope = scope;
    this.parentScopes = parentScopes;
    this.index = index;
    this.fontStyle = fontStyle;
    this.foreground = foreground;
    this.background = background;
};

function isValidHexColor(hex) {
    if (/^#[0-9a-f]{6}$/i.test(hex)) return true;
    if (/^#[0-9a-f]{8}$/i.test(hex)) return true;
    if (/^#[0-9a-f]{3}$/i.test(hex)) return true;
    if (/^#[0-9a-f]{4}$/i.test(hex)) return true;
    return false;
}

function parseTheme(source) {
    if (!source) {
        return [];
    }
    if (!source.settings || !Array.isArray(source.settings)) {
        return [];
    }
    var settings = source.settings;
    var result = [],
        resultLen = 0;
    for (var i = 0, len = settings.length; i < len; i++) {
        var entry = settings[i];
        if (!entry.settings) {
            continue;
        }
        var scopes = void 0;
        if (typeof entry.scope === 'string') {
            var _scope = entry.scope;
            _scope = _scope.replace(/^[,]+/, '');
            _scope = _scope.replace(/[,]+$/, '');
            scopes = _scope.split(',');
        } else if (Array.isArray(entry.scope)) {
            scopes = entry.scope;
        } else {
            scopes = [''];
        }
        var fontStyle = -1;
        if (typeof entry.settings.fontStyle === 'string') {
            fontStyle = 0;
            var segments = entry.settings.fontStyle.split(' ');
            for (var j = 0, lenJ = segments.length; j < lenJ; j++) {
                var segment = segments[j];
                switch (segment) {
                    case 'italic':
                        fontStyle = fontStyle | 1;
                        break;
                    case 'bold':
                        fontStyle = fontStyle | 2;
                        break;
                    case 'underline':
                        fontStyle = fontStyle | 4;
                        break;
                }
            }
        }
        var foreground = null;
        if (typeof entry.settings.foreground === 'string' && isValidHexColor(entry.settings.foreground)) {
            foreground = entry.settings.foreground;
        }
        var background = null;
        if (typeof entry.settings.background === 'string' && isValidHexColor(entry.settings.background)) {
            background = entry.settings.background;
        }
        for (var _j = 0, _lenJ = scopes.length; _j < _lenJ; _j++) {
            var _scope2 = scopes[_j].trim();
            var _segments = _scope2.split(' ');
            var scope = _segments[_segments.length - 1];
            var parentScopes = null;
            if (_segments.length > 1) {
                parentScopes = _segments.slice(0, _segments.length - 1);
                parentScopes.reverse();
            }
            result[resultLen++] = new ParsedThemeRule(scope, parentScopes, i, fontStyle, foreground, background);
        }
    }
    return result;
}

function resolveParsedThemeRules(parsedThemeRules) {
    parsedThemeRules.sort(function (a, b) {
        var r = strcmp(a.scope, b.scope);
        if (r !== 0) {
            return r;
        }
        r = strArrCmp(a.parentScopes, b.parentScopes);
        if (r !== 0) {
            return r;
        }
        return a.index - b.index;
    });
    var defaultFontStyle = 0;
    var defaultForeground = '#000000';
    var defaultBackground = '#ffffff';
    while (parsedThemeRules.length >= 1 && parsedThemeRules[0].scope === '') {
        var incomingDefaults = parsedThemeRules.shift();
        if (incomingDefaults.fontStyle !== -1) {
            defaultFontStyle = incomingDefaults.fontStyle;
        }
        if (incomingDefaults.foreground !== null) {
            defaultForeground = incomingDefaults.foreground;
        }
        if (incomingDefaults.background !== null) {
            defaultBackground = incomingDefaults.background;
        }
    }
    var colorMap = new ColorMap();
    var defaults = new ThemeTrieElementRule(0, null, defaultFontStyle, colorMap.getId(defaultForeground), colorMap.getId(defaultBackground));
    var root = new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1, 0, 0), []);
    for (var i = 0, len = parsedThemeRules.length; i < len; i++) {
        var rule = parsedThemeRules[i];
        root.insert(0, rule.scope, rule.parentScopes, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
    }
    return new Theme(colorMap, defaults, root);
}

var ColorMap = exports.ColorMap = function () {
    function ColorMap() {
        _classCallCheck(this, ColorMap);

        this._lastColorId = 0;
        this._id2color = [];
        this._color2id = Object.create(null);
    }

    _createClass(ColorMap, [{
        key: 'getId',
        value: function getId(color) {
            if (color === null) {
                return 0;
            }
            color = color.toUpperCase();
            var value = this._color2id[color];
            if (value) {
                return value;
            }
            value = ++this._lastColorId;
            this._color2id[color] = value;
            this._id2color[value] = color;
            return value;
        }
    }, {
        key: 'getColorMap',
        value: function getColorMap() {
            return this._id2color.slice(0);
        }
    }]);

    return ColorMap;
}();

var Theme = exports.Theme = function () {
    _createClass(Theme, null, [{
        key: 'createFromRawTheme',
        value: function createFromRawTheme(source) {
            return this.createFromParsedTheme(parseTheme(source));
        }
    }, {
        key: 'createFromParsedTheme',
        value: function createFromParsedTheme(source) {
            return resolveParsedThemeRules(source);
        }
    }]);

    function Theme(colorMap, defaults, root) {
        _classCallCheck(this, Theme);

        this._colorMap = colorMap;
        this._root = root;
        this._defaults = defaults;
        this._cache = {};
    }

    _createClass(Theme, [{
        key: 'getColorMap',
        value: function getColorMap() {
            return this._colorMap.getColorMap();
        }
    }, {
        key: 'getDefaults',
        value: function getDefaults() {
            return this._defaults;
        }
    }, {
        key: 'match',
        value: function match(scopeName) {
            if (!this._cache.hasOwnProperty(scopeName)) {
                this._cache[scopeName] = this._root.match(scopeName);
            }
            return this._cache[scopeName];
        }
    }]);

    return Theme;
}();

function strcmp(a, b) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

function strArrCmp(a, b) {
    if (a === null && b === null) {
        return 0;
    }
    if (!a) {
        return -1;
    }
    if (!b) {
        return 1;
    }
    var len1 = a.length;
    var len2 = b.length;
    if (len1 === len2) {
        for (var i = 0; i < len1; i++) {
            var res = strcmp(a[i], b[i]);
            if (res !== 0) {
                return res;
            }
        }
        return 0;
    }
    return len1 - len2;
}

var ThemeTrieElementRule = exports.ThemeTrieElementRule = function () {
    function ThemeTrieElementRule(scopeDepth, parentScopes, fontStyle, foreground, background) {
        _classCallCheck(this, ThemeTrieElementRule);

        this.scopeDepth = scopeDepth;
        this.parentScopes = parentScopes;
        this.fontStyle = fontStyle;
        this.foreground = foreground;
        this.background = background;
    }

    _createClass(ThemeTrieElementRule, [{
        key: 'clone',
        value: function clone() {
            return new ThemeTrieElementRule(this.scopeDepth, this.parentScopes, this.fontStyle, this.foreground, this.background);
        }
    }, {
        key: 'acceptOverwrite',
        value: function acceptOverwrite(scopeDepth, fontStyle, foreground, background) {
            if (this.scopeDepth > scopeDepth) {
                console.log('how did this happen?');
            } else {
                this.scopeDepth = scopeDepth;
            }
            if (fontStyle !== -1) {
                this.fontStyle = fontStyle;
            }
            if (foreground !== 0) {
                this.foreground = foreground;
            }
            if (background !== 0) {
                this.background = background;
            }
        }
    }], [{
        key: 'cloneArr',
        value: function cloneArr(arr) {
            var r = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                r[i] = arr[i].clone();
            }
            return r;
        }
    }]);

    return ThemeTrieElementRule;
}();

var ThemeTrieElement = exports.ThemeTrieElement = function () {
    function ThemeTrieElement(mainRule) {
        var rulesWithParentScopes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, ThemeTrieElement);

        this._mainRule = mainRule;
        this._rulesWithParentScopes = rulesWithParentScopes;
        this._children = children;
    }

    _createClass(ThemeTrieElement, [{
        key: 'match',
        value: function match(scope) {
            if (scope === '') {
                return ThemeTrieElement._sortBySpecificity([].concat(this._mainRule).concat(this._rulesWithParentScopes));
            }
            var dotIndex = scope.indexOf('.');
            var head = void 0;
            var tail = void 0;
            if (dotIndex === -1) {
                head = scope;
                tail = '';
            } else {
                head = scope.substring(0, dotIndex);
                tail = scope.substring(dotIndex + 1);
            }
            if (this._children.hasOwnProperty(head)) {
                return this._children[head].match(tail);
            }
            return ThemeTrieElement._sortBySpecificity([].concat(this._mainRule).concat(this._rulesWithParentScopes));
        }
    }, {
        key: 'insert',
        value: function insert(scopeDepth, scope, parentScopes, fontStyle, foreground, background) {
            if (scope === '') {
                this._doInsertHere(scopeDepth, parentScopes, fontStyle, foreground, background);
                return;
            }
            var dotIndex = scope.indexOf('.');
            var head = void 0;
            var tail = void 0;
            if (dotIndex === -1) {
                head = scope;
                tail = '';
            } else {
                head = scope.substring(0, dotIndex);
                tail = scope.substring(dotIndex + 1);
            }
            var child = void 0;
            if (this._children.hasOwnProperty(head)) {
                child = this._children[head];
            } else {
                child = new ThemeTrieElement(this._mainRule.clone(), ThemeTrieElementRule.cloneArr(this._rulesWithParentScopes));
                this._children[head] = child;
            }
            child.insert(scopeDepth + 1, tail, parentScopes, fontStyle, foreground, background);
        }
    }, {
        key: '_doInsertHere',
        value: function _doInsertHere(scopeDepth, parentScopes, fontStyle, foreground, background) {
            if (parentScopes === null) {
                this._mainRule.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
                return;
            }
            for (var i = 0, len = this._rulesWithParentScopes.length; i < len; i++) {
                var rule = this._rulesWithParentScopes[i];
                if (strArrCmp(rule.parentScopes, parentScopes) === 0) {
                    rule.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
                    return;
                }
            }
            if (fontStyle === -1) {
                fontStyle = this._mainRule.fontStyle;
            }
            if (foreground === 0) {
                foreground = this._mainRule.foreground;
            }
            if (background === 0) {
                background = this._mainRule.background;
            }
            this._rulesWithParentScopes.push(new ThemeTrieElementRule(scopeDepth, parentScopes, fontStyle, foreground, background));
        }
    }], [{
        key: '_sortBySpecificity',
        value: function _sortBySpecificity(arr) {
            if (arr.length === 1) {
                return arr;
            }
            arr.sort(this._cmpBySpecificity);
            return arr;
        }
    }, {
        key: '_cmpBySpecificity',
        value: function _cmpBySpecificity(a, b) {
            if (a.scopeDepth === b.scopeDepth) {
                var aParentScopes = a.parentScopes;
                var bParentScopes = b.parentScopes;
                var aParentScopesLen = aParentScopes === null ? 0 : aParentScopes.length;
                var bParentScopesLen = bParentScopes === null ? 0 : bParentScopes.length;
                if (aParentScopesLen === bParentScopesLen) {
                    for (var i = 0; i < aParentScopesLen; i++) {
                        var aLen = aParentScopes[i].length;
                        var bLen = bParentScopes[i].length;
                        if (aLen !== bLen) {
                            return bLen - aLen;
                        }
                    }
                }
                return bParentScopesLen - aParentScopesLen;
            }
            return b.scopeDepth - a.scopeDepth;
        }
    }]);

    return ThemeTrieElement;
}();