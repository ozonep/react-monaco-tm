"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createTextmateTokenizer = createTextmateTokenizer;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var TokenizerOption = exports.TokenizerOption = {
    lineLimit: 400
};

function createTextmateTokenizer(grammar) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TokenizerOption;

    return {
        getInitialState: function getInitialState() {
            return new TokenizerState(INITIAL);
        },
        tokenizeEncoded: function tokenizeEncoded(line, state) {
            var processedLine = line;
            if (options.lineLimit !== undefined && line.length > options.lineLimit) {
                processedLine = line.substr(0, options.lineLimit);
            }
            var result = grammar.tokenizeLine2(processedLine, state.ruleStack);
            return {
                endState: new TokenizerState(result.ruleStack),
                tokens: result.tokens
            };
        }
    };
}