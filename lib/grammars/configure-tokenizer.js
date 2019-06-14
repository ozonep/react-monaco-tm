'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.liftOff = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var liftOff = exports.liftOff = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(monaco, languageId, editor) {
    var langId, _languagesToRegister$, _languagesToRegister$2, scope, oneGrammar;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            langId = languageId;

            console.log('langId', langId);
            if (languageId === 'plaintext') langId = 'javascript';
            _languagesToRegister$ = languagesToRegister.find(function (_ref2) {
              var _ref3 = _slicedToArray(_ref2, 1),
                  id = _ref3[0];

              return id === langId;
            }), _languagesToRegister$2 = _slicedToArray(_languagesToRegister$, 2), scope = _languagesToRegister$2[1];
            oneGrammar = _grammars.grammars.filter(function (grammar) {
              return grammar.language === langId;
            });
            _context.next = 7;
            return (0, _setGrammars.wireTmGrammars)(monaco, registry, oneGrammar, langId, scope, editor);

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function liftOff(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var _setGrammars = require('./set-grammars');

var _resolver = require('../monaco-textmate/tests/resolver');

var _grammars = require('../monaco-textmate/grammars');

var _onigLibs = require('../monaco-textmate/onigLibs');

var _main = require('../monaco-textmate/main');

var _textmateRegistry = require('../textMate/textmate-registry');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var languagesToRegister = [["css", "source.css"], ["html", "text.html.basic"], ["javascript", "source.js"], ["javascript", "source.js.jsx"], ["json", "source.json"], ["python", "source.python"], ["typescript", "source.tsx"], ["typescript", "source.ts"]];

var onigasmResolver = new _resolver.Resolver(_grammars.grammars, _grammars.languages, (0, _onigLibs.getOnigasm)());
var registry = new _main.Registry(onigasmResolver);