'use strict';

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _assert = require('assert');

var assert = _interopRequireWildcard(_assert);

var _main = require('../main');

var _onigLibs = require('../onigLibs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var REPO_ROOT = path.join(__dirname, '../../');
function assertTokenizationSuite(testLocation) {
    var performTest = function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(test, onigLib) {
            var grammarScopeName, grammarByScope, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, grammarPath, content, rawGrammar, locator, registry, grammar, prevState, i;

            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            grammarScopeName = test.grammarScopeName;
                            grammarByScope = {};
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context.prev = 5;

                            for (_iterator = test.grammars[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                grammarPath = _step.value;
                                content = fs.readFileSync(path.join(path.dirname(testLocation), grammarPath)).toString();
                                rawGrammar = (0, _main.parseJSONGrammar)(content, grammarPath);

                                grammarByScope[rawGrammar.scopeName] = rawGrammar;
                                if (!grammarScopeName && grammarPath === test.grammarPath) {
                                    grammarScopeName = rawGrammar.scopeName;
                                }
                            }
                            _context.next = 13;
                            break;

                        case 9:
                            _context.prev = 9;
                            _context.t0 = _context['catch'](5);
                            _didIteratorError = true;
                            _iteratorError = _context.t0;

                        case 13:
                            _context.prev = 13;
                            _context.prev = 14;

                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }

                        case 16:
                            _context.prev = 16;

                            if (!_didIteratorError) {
                                _context.next = 19;
                                break;
                            }

                            throw _iteratorError;

                        case 19:
                            return _context.finish(16);

                        case 20:
                            return _context.finish(13);

                        case 21:
                            ;
                            locator = {
                                loadGrammar: function loadGrammar(scopeName) {
                                    return Promise.resolve(grammarByScope[scopeName]);
                                },
                                getInjections: function getInjections(scopeName) {
                                    if (scopeName === grammarScopeName) {
                                        return test.grammarInjections;
                                    }
                                },
                                getOnigLib: function getOnigLib() {
                                    return onigLib;
                                }
                            };
                            registry = new _main.Registry(locator);
                            _context.next = 26;
                            return registry.loadGrammar(grammarScopeName);

                        case 26:
                            grammar = _context.sent;

                            if (grammar) {
                                _context.next = 29;
                                break;
                            }

                            throw new Error('I HAVE NO GRAMMAR FOR TEST');

                        case 29:
                            prevState = null;

                            for (i = 0; i < test.lines.length; i++) {
                                prevState = assertLineTokenization(grammar, test.lines[i], prevState);
                            }

                        case 31:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[5, 9, 13, 21], [14,, 16, 20]]);
        }));

        return function performTest(_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();

    var tests = JSON.parse(fs.readFileSync(testLocation).toString());
    tests.forEach(function (test) {
        it(test.desc + '-onigasm', function () {
            return performTest(test, (0, _onigLibs.getOnigasm)());
        });
    });

    function assertLineTokenization(grammar, testCase, prevState) {
        var actual = grammar.tokenizeLine(testCase.line, prevState);
        var actualTokens = actual.tokens.map(function (token) {
            return {
                value: testCase.line.substring(token.startIndex, token.endIndex),
                scopes: token.scopes
            };
        });
        if (testCase.line.length > 0) {
            testCase.tokens = testCase.tokens.filter(function (token) {
                return token.value.length > 0;
            });
        }
        assert.deepStrictEqual(actualTokens, testCase.tokens, 'Tokenizing line ' + testCase.line);
        return actual.ruleStack;
    }
}
describe('Tokenization /first-mate/', function () {
    assertTokenizationSuite(path.join(REPO_ROOT, 'test-cases/first-mate/tests.json'));
});
describe('Tokenization /suite1/', function () {
    assertTokenizationSuite(path.join(REPO_ROOT, 'test-cases/suite1/tests.json'));
    assertTokenizationSuite(path.join(REPO_ROOT, 'test-cases/suite1/whileTests.json'));
});