'use strict';

var _assert = require('assert');

var assert = _interopRequireWildcard(_assert);

var _matcher = require('../matcher');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('Matcher', function () {
    var tests = [{ "expression": "foo", "input": ["foo"], "result": true }, { "expression": "foo", "input": ["bar"], "result": false }, { "expression": "- foo", "input": ["foo"], "result": false }, { "expression": "- foo", "input": ["bar"], "result": true }, { "expression": "- - foo", "input": ["bar"], "result": false }, { "expression": "bar foo", "input": ["foo"], "result": false }, { "expression": "bar foo", "input": ["bar"], "result": false }, { "expression": "bar foo", "input": ["bar", "foo"], "result": true }, { "expression": "bar - foo", "input": ["bar"], "result": true }, { "expression": "bar - foo", "input": ["foo", "bar"], "result": false }, { "expression": "bar - foo", "input": ["foo"], "result": false }, { "expression": "bar, foo", "input": ["foo"], "result": true }, { "expression": "bar, foo", "input": ["bar"], "result": true }, { "expression": "bar, foo", "input": ["bar", "foo"], "result": true }, { "expression": "bar, -foo", "input": ["bar", "foo"], "result": true }, { "expression": "bar, -foo", "input": ["yo"], "result": true }, { "expression": "bar, -foo", "input": ["foo"], "result": false }, { "expression": "(foo)", "input": ["foo"], "result": true }, { "expression": "(foo - bar)", "input": ["foo"], "result": true }, { "expression": "(foo - bar)", "input": ["foo", "bar"], "result": false }, { "expression": "foo bar - (yo man)", "input": ["foo", "bar"], "result": true }, { "expression": "foo bar - (yo man)", "input": ["foo", "bar", "yo"], "result": true }, { "expression": "foo bar - (yo man)", "input": ["foo", "bar", "yo", "man"], "result": false }, { "expression": "foo bar - (yo | man)", "input": ["foo", "bar", "yo", "man"], "result": false }, { "expression": "foo bar - (yo | man)", "input": ["foo", "bar", "yo"], "result": false }, { "expression": "R:text.html - (comment.block, text.html source)", "input": ["text.html", "bar", "source"], "result": false }, { "expression": "text.html.php - (meta.embedded | meta.tag), L:text.html.php meta.tag, L:source.js.embedded.html", "input": ["text.html.php", "bar", "source.js"], "result": true }];
    var nameMatcher = function nameMatcher(identifers, stackElements) {
        var lastIndex = 0;
        return identifers.every(function (identifier) {
            for (var i = lastIndex; i < stackElements.length; i++) {
                if (stackElements[i] === identifier) {
                    lastIndex = i + 1;
                    return true;
                }
            }
            return false;
        });
    };
    tests.forEach(function (test, index) {
        it('Test #' + index, function () {
            var matchers = (0, _matcher.createMatchers)(test.expression, nameMatcher);
            var result = matchers.some(function (m) {
                return m.matcher(test.input);
            });
            assert.strictEqual(result, test.result);
        });
    });
});