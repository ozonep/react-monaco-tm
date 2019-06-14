"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DARK_SCICODE_THEME = exports.DARK_DEFAULT_THEME = exports.SINGLETON = exports.MonacoThemeRegistry = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vscodeTextmate = require('vscode-textmate');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MonacoThemeRegistry = exports.MonacoThemeRegistry = function () {
    function MonacoThemeRegistry() {
        _classCallCheck(this, MonacoThemeRegistry);
    }

    _createClass(MonacoThemeRegistry, null, [{
        key: 'getTheme',
        value: function getTheme(name) {
            return this.themes.get(name);
        }
    }, {
        key: 'register',
        value: function register(json, includes, givenName, monacoBase) {
            var name = givenName || json.name;
            var result = {
                name: name,
                base: monacoBase || 'vs',
                inherit: true,
                colors: {},
                rules: [],
                settings: []
            };
            if (this.themes.has(name)) {
                return this.themes.get(name);
            }
            this.themes.set(name, result);
            if (typeof json.include !== 'undefined') {
                if (!includes || !includes[json.include]) {
                    console.error('Couldn\'t resolve includes theme ' + json.include + '.');
                } else {
                    var _result$rules, _result$settings;

                    var parentTheme = this.register(includes[json.include], includes);
                    Object.assign(result.colors, parentTheme.colors);
                    (_result$rules = result.rules).push.apply(_result$rules, _toConsumableArray(parentTheme.rules));
                    (_result$settings = result.settings).push.apply(_result$settings, _toConsumableArray(parentTheme.settings));
                }
            }
            if (json.tokenColors) {
                var _result$settings2;

                (_result$settings2 = result.settings).push.apply(_result$settings2, _toConsumableArray(json.tokenColors));
            }
            if (json.colors) {
                Object.assign(result.colors, json.colors);
                result.encodedTokensColors = Object.keys(result.colors).map(function (key) {
                    return result.colors[key];
                });
            }
            if (monacoBase && givenName) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = result.settings[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var setting = _step.value;

                        this.transform(setting, function (rule) {
                            return result.rules.push(rule);
                        });
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

                var reg = new _vscodeTextmate.Registry();
                reg.setTheme(result);
                result.encodedTokensColors = reg.getColorMap();
                result.encodedTokensColors[0] = null;
                if (result.colors && result.colors['editor.foreground']) {
                    result.encodedTokensColors[1] = result.colors['editor.foreground'];
                }
                if (result.colors && result.colors['editor.background']) {
                    result.encodedTokensColors[2] = result.colors['editor.background'];
                }
                monaco.editor.defineTheme(givenName, result);
            }
            return result;
        }
    }, {
        key: 'transform',
        value: function transform(tokenColor, acceptor) {
            if (typeof tokenColor.scope === 'undefined') {
                tokenColor.scope = [''];
            } else if (typeof tokenColor.scope === 'string') {
                tokenColor.scope = [tokenColor.scope];
            }
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = tokenColor.scope[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var scope = _step2.value;

                    var settings = Object.keys(tokenColor.settings).reduce(function (previous, current) {
                        var value = tokenColor.settings[current];
                        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === _typeof('')) {
                            value = value.replace(/^\#/, '').slice(0, 6);
                        }
                        previous[current] = value;
                        return previous;
                    }, {});
                    acceptor(_extends({}, settings, { token: scope
                    }));
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }]);

    return MonacoThemeRegistry;
}();

MonacoThemeRegistry.themes = new Map();
var SINGLETON = exports.SINGLETON = new MonacoThemeRegistry();
var DARK_DEFAULT_THEME = exports.DARK_DEFAULT_THEME = SINGLETON.register(require('../../../data/monaco-themes/vscode/dark_plus.json'), {
    './dark_defaults.json': require('../../../data/monaco-themes/vscode/dark_defaults.json'),
    './dark_vs.json': require('../../../data/monaco-themes/vscode/dark_vs.json')
}, 'dark-plus', 'vs-dark').name;
var DARK_SCICODE_THEME = exports.DARK_SCICODE_THEME = SINGLETON.register(require('../../../data/monaco-themes/vscode/dark_plus.json'), {
    './dark_defaults.json': require('../../../data/monaco-themes/vscode/dark_defaults.json'),
    './dark_vs.json': require('../../../data/monaco-themes/vscode/dark_vs.json')
}, 'one-dark', 'vs-dark').name;