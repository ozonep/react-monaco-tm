"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TokenizerState = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.wireTmGrammars = wireTmGrammars;

var _main = require("../monaco-textmate/main");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var langsInjected = false;

var TokenizerState = exports.TokenizerState = function () {
    function TokenizerState(ruleStack) {
        _classCallCheck(this, TokenizerState);

        this.ruleStack = ruleStack;
    }

    _createClass(TokenizerState, [{
        key: "clone",
        value: function clone() {
            return new TokenizerState(this.ruleStack);
        }
    }, {
        key: "equals",
        value: function equals(other) {
            return other instanceof TokenizerState && (other === this || other.ruleStack === this.ruleStack);
        }
    }]);

    return TokenizerState;
}();

function wireTmGrammars(monaco, registry, grammars, langId, scope, editor) {
    var _this = this;

    return Promise.all(grammars.map(function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(gram) {
            var grammar;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return registry.loadGrammar(scope);

                        case 2:
                            grammar = _context.sent;

                            monaco.languages.setTokensProvider(langId, {
                                getInitialState: function getInitialState() {
                                    return new TokenizerState(_main.INITIAL);
                                },
                                tokenize: function tokenize(line, state) {
                                    var res = grammar.tokenizeLine(line, state.ruleStack);
                                    return {
                                        endState: new TokenizerState(res.ruleStack),
                                        tokens: res.tokens.map(function (token) {
                                            return _extends({}, token, {
                                                scopes: TMToMonacoToken(editor, token.scopes)
                                            });
                                        })
                                    };
                                }
                            });

                        case 4:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    }()));
}

var TMToMonacoToken = function TMToMonacoToken(editor, scopes) {
    var scopeName = "";
    for (var i = scopes[0].length - 1; i >= 0; i -= 1) {
        var char = scopes[0][i];
        if (char === ".") break;
        scopeName = char + scopeName;
    }
    for (var _i = scopes.length - 1; _i >= 0; _i -= 1) {
        var scope = scopes[_i];
        for (var _i2 = scope.length - 1; _i2 >= 0; _i2 -= 1) {
            var _char = scope[_i2];
            if (_char === ".") {
                var token = scope.slice(0, _i2);
                if (editor._themeService.getTheme()._tokenTheme._match(token + "." + scopeName)._foreground > 1) {
                    return token + "." + scopeName;
                }
                if (editor._themeService.getTheme()._tokenTheme._match(token)._foreground > 1) {
                    return token;
                }
            }
        }
    }
    return "";
};