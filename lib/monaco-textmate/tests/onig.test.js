'use strict';

var addTest = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(scopeName, filePath, onigasmRegistry) {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        it(scopeName + '/' + path.basename(filePath), _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                            var fileContent, lines, prevState2, grammar2, stopWatch2, i, t2;
                            return regeneratorRuntime.wrap(function _callee$(_context) {
                                while (1) {
                                    switch (_context.prev = _context.next) {
                                        case 0:
                                            fileContent = fs.readFileSync(filePath).toString();
                                            lines = fileContent.match(/[^\r\n]+/g);
                                            prevState2 = null;
                                            _context.next = 5;
                                            return onigasmRegistry.loadGrammar(scopeName);

                                        case 5:
                                            grammar2 = _context.sent;
                                            stopWatch2 = durations.stopwatch();

                                            for (i = 0; i < lines.length; i++) {
                                                t2 = grammar2.tokenizeLine(lines[i], prevState2);

                                                prevState2 = t2.ruleStack;
                                            }
                                            console.log('Oniguruma: ' + stopWatch1.format() + ', Onigasm: ' + stopWatch2.format() + ' (' + Math.round(stopWatch2.duration().micros() * 10 / stopWatch1.duration().micros()) / 10 + 'x slower)');

                                        case 9:
                                        case 'end':
                                            return _context.stop();
                                    }
                                }
                            }, _callee, _this);
                        }))).timeout(1000000);

                    case 1:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function addTest(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _durations = require('durations');

var durations = _interopRequireWildcard(_durations);

var _resolver = require('./resolver');

var _onigLibs = require('../onigLibs');

var _main = require('../main');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

describe.skip('Compare OnigLibs outputs', function () {
    var registrations = getVSCodeRegistrations();
    ;
    if (!registrations) {
        console.log('vscode repo not found, skipping OnigLibs tests');
        return;
    }
    var onigasmResolver = new _resolver.Resolver(registrations.grammarRegistrations, registrations.languageRegistrations, (0, _onigLibs.getOnigasm)(), 'onigasm');
    var fixturesDir = path.join(__dirname, '../../test-cases/onigtests/fixtures');
    var fixturesFiles = fs.readdirSync(fixturesDir);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = fixturesFiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var fixturesFile = _step.value;

            var testFilePath = path.join(fixturesDir, fixturesFile);
            var scopeName = onigasmResolver.findScopeByFilename(fixturesFile);
            addTest(scopeName, testFilePath, new _main.Registry(onigasmResolver));
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
});

function getVSCodeRegistrations() {
    var grammarRegistrations = [];
    var languageRegistrations = [];
    var extensionsPath = path.join(__dirname, '../../../vscode/extensions');
    if (!fs.existsSync(extensionsPath)) {
        return null;
    }
    var extDirs = fs.readdirSync(extensionsPath);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = extDirs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var ext = _step2.value;

            try {
                var packageJSONPath = path.join(extensionsPath, ext, 'package.json');
                if (!fs.existsSync(packageJSONPath)) {
                    continue;
                }
                var packageJSON = JSON.parse(fs.readFileSync(packageJSONPath).toString());
                var contributes = packageJSON['contributes'];
                if (contributes) {
                    var grammars = contributes['grammars'];
                    if (Array.isArray(grammars)) {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = grammars[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var grammar = _step3.value;

                                var registration = {
                                    scopeName: grammar.scopeName,
                                    path: path.join(extensionsPath, ext, grammar.path),
                                    language: grammar.language,
                                    embeddedLanguages: grammar.embeddedLanguages
                                };
                                grammarRegistrations.push(registration);
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }
                    }
                    var languages = contributes['languages'];
                    if (Array.isArray(languages)) {
                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                            for (var _iterator4 = languages[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                var language = _step4.value;

                                var _registration = {
                                    id: language.id,
                                    filenames: language.filenames,
                                    extensions: language.extensions
                                };
                                languageRegistrations.push(_registration);
                            }
                        } catch (err) {
                            _didIteratorError4 = true;
                            _iteratorError4 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }
                            } finally {
                                if (_didIteratorError4) {
                                    throw _iteratorError4;
                                }
                            }
                        }
                    }
                }
            } catch (e) {}
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

    return { grammarRegistrations: grammarRegistrations, languageRegistrations: languageRegistrations };
}