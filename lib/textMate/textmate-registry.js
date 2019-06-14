"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextmateRegistry = exports.TextmateRegistry = function () {
    function TextmateRegistry() {
        _classCallCheck(this, TextmateRegistry);
    }

    _createClass(TextmateRegistry, null, [{
        key: "registerTextmateGrammarScope",
        value: function registerTextmateGrammarScope(scope, description) {
            if (this.scopeToProvider.has(scope)) console.warn(new Error("a registered grammar provider for '" + scope + "' scope is overridden"));
            this.scopeToProvider.set(scope, description);
        }
    }, {
        key: "getProvider",
        value: function getProvider(scope) {
            return this.scopeToProvider.get(scope);
        }
    }, {
        key: "mapLanguageIdToTextmateGrammar",
        value: function mapLanguageIdToTextmateGrammar(languageId, scope) {
            var existingScope = this.getScope(languageId);
            if (typeof existingScope === 'string') console.warn(new Error("'" + languageId + "' language is remapped from '" + existingScope + "' to '" + scope + "' scope"));
            this.languageIdToScope.set(languageId, scope);
        }
    }, {
        key: "getScope",
        value: function getScope(languageId) {
            return this.languageIdToScope.get(languageId);
        }
    }, {
        key: "getLanguageId",
        value: function getLanguageId(scope) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.languageIdToScope.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    if (this.languageIdToScope.get(key) === scope) return key;
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

            return undefined;
        }
    }, {
        key: "registerGrammarConfiguration",
        value: function registerGrammarConfiguration(languageId, config) {
            if (this.languageToConfig.has(languageId)) console.warn(new Error("a registered grammar configuration for '" + languageId + "' language is overridden"));
            this.languageToConfig.set(languageId, config);
        }
    }, {
        key: "getGrammarConfiguration",
        value: function getGrammarConfiguration(languageId) {
            return this.languageToConfig.get(languageId) || {};
        }
    }]);

    return TextmateRegistry;
}();

TextmateRegistry.scopeToProvider = new Map();
TextmateRegistry.languageToConfig = new Map();
TextmateRegistry.languageIdToScope = new Map();