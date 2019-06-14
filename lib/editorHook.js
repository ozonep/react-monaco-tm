"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _editor = require("monaco-editor-no-lang/esm/vs/editor/editor.main");

var monaco = _interopRequireWildcard(_editor);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _utils = require("./utils");

var _configureTokenizer = require("./grammars/configure-tokenizer");

var _langConfigurations = require("./grammars/langConfigurations");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* eslint-disable */


var noop = function noop() {};

var editor = null;
var langsConfigured = false;

function Configurator() {
    (0, _langConfigurations.langConfigs)(monaco);
    langsConfigured = true;
}

!langsConfigured && Configurator();

monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
});

var compilerDefaults = {
    jsxFactory: 'React.createElement',
    reactNamespace: 'React',
    jsx: monaco.languages.typescript.JsxEmit.React,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.System,
    experimentalDecorators: true,
    noEmit: true,
    allowJs: true,
    typeRoots: ['node_modules/@types'],
    newLine: monaco.languages.typescript.NewLineKind.LineFeed
};

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerDefaults);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerDefaults);

var findModel = function findModel(path) {
    return monaco.editor.getModels().find(function (model) {
        return model.uri.path === "" + path;
    });
};
var editorStates = new Map();
var extraLibs = new Map();

function MonacoEditor(props) {
    var _this = this;

    var containerElement = (0, _react.useRef)(null);
    var options = props.options,
        width = props.width,
        height = props.height,
        path = props.path,
        theme = props.theme;

    var value = props.value !== null ? props.value : props.defaultValue;
    var typingsWorker = void 0;
    var subscription = void 0;

    // const usePrevious = (value) => {
    //     const ref = useRef();
    //     useEffect(() => {
    //         ref.current = value;
    //     });
    //     return ref.current;
    // };

    var updateDimensions = function updateDimensions() {
        editor.layout();
    };

    var removePath = function removePath(path) {
        editorStates.delete(path);
        var model = findModel(path);
        model && model.dispose();
    };

    // const renamePath = (oldPath, newPath) => {
    //     const selection = editorStates.get(oldPath);
    //     editorStates.delete(oldPath);
    //     editorStates.set(newPath, selection);
    //     removePath(oldPath);
    // };

    var editorDidMount = function editorDidMount(editor) {
        window.addEventListener("resize", updateDimensions);
        // props.editorDidMount(model);
        monaco.languages.typescript.typescriptDefaults.setMaximumWorkerIdleTime(-1);
        monaco.languages.typescript.javascriptDefaults.setMaximumWorkerIdleTime(-1);
        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    };

    var initMonaco = function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            var _ref3, data;

            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            typingsWorker = new Worker('./workers/typings.worker.js', { type: 'module' });
                            typingsWorker.addEventListener('message', function (_ref2) {
                                var data = _ref2.data;
                                return addTypings(data);
                            });
                            typingsWorker.postMessage({
                                name: 'react',
                                version: '16.8.6'
                            });

                            if (!containerElement.current) {
                                _context.next = 14;
                                break;
                            }

                            editor = monaco.editor.create(containerElement.current, _extends({
                                model: null
                            }, options));
                            _context.next = 7;
                            return import('./themes/oneDarkMonaco');

                        case 7:
                            _ref3 = _context.sent;
                            data = _ref3.default;

                            monaco.editor.defineTheme('one-dark', data);
                            monaco.editor.setTheme('one-dark');
                            _context.next = 13;
                            return editorDidMount(editor);

                        case 13:
                            initializeFile(path, value);

                        case 14:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        return function initMonaco() {
            return _ref.apply(this, arguments);
        };
    }();

    var destroyMonaco = function destroyMonaco() {
        if (typeof editor !== "undefined") {
            window.removeEventListener("resize", updateDimensions);
            typingsWorker && typingsWorker.terminate();
            subscription && subscription.dispose();
            editor.dispose();
        }
    };

    var initializeFile = function initializeFile(path, value) {
        var model = findModel(path);
        console.log("INITIALIZATION");
        if (model) {
            console.log("MODEL_EXISTS");
            model.pushEditOperations([], [{
                range: model.getFullModelRange(),
                text: value
            }]);
        } else {
            console.log("MODEL_DOESN'T EXIST");
            model = monaco.editor.createModel(value, undefined, monaco.Uri.from({ scheme: 'file', path: path }));
            console.log('MODEL CREATED');
            model.updateOptions({
                tabSize: 2,
                insertSpaces: true
            });
        }
    };

    subscription = editor && editor.onDidChangeModelContent(function () {
        var model = editor.getModel();
        if (model) {
            var _value = model.getValue();
            if (_value !== props.value) {
                props.onChange(_value, editor);
            }
        }
    });

    var addTypings = function addTypings(_ref4) {
        var typings = _ref4.typings;

        Object.keys(typings).forEach(function (path) {
            var extraLib = extraLibs.get(path);
            if (extraLib) {
                extraLib.js && extraLib.js.dispose();
                extraLib.ts && extraLib.ts.dispose();
            }
            extraLib = monaco.languages.typescript.javascriptDefaults.addExtraLib(typings[path], monaco.Uri.from({ scheme: 'file', path: path }).toString());
            extraLibs.set(path, extraLib);
        });
    };

    var openFile = function () {
        var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(path, value) {
            var model;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            initializeFile(path, value);
                            model = findModel(path);

                            if (!(editor && model)) {
                                _context2.next = 5;
                                break;
                            }

                            _context2.next = 5;
                            return editor.setModel(model);

                        case 5:
                        case "end":
                            return _context2.stop();
                    }
                }
            }, _callee2, _this);
        }));

        return function openFile(_x, _x2) {
            return _ref5.apply(this, arguments);
        };
    }();

    (0, _react.useEffect)(function () {
        initMonaco();
        return function () {
            return destroyMonaco();
        };
    }, []);

    (0, _react.useEffect)(function () {
        if (editor && editor.getModel()) {
            var model = editor.getModel();
            editor.executeEdits(null, [{
                range: model.getFullModelRange(),
                text: value
            }]);
        }
    }, [value]);

    // const prevPath = usePrevious(path);
    (0, _react.useEffect)(function () {
        var changePath = function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                console.log('PATH CHANGED');
                                // editorStates.set(prevPath, editor.saveViewState());
                                _context3.next = 3;
                                return openFile(path, value);

                            case 3:
                                console.log('THIS IS LANG', editor.getModel().getModeId());
                                _context3.next = 6;
                                return (0, _configureTokenizer.liftOff)(monaco, editor.getModel().getModeId(), editor);

                            case 6:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            return function changePath() {
                return _ref6.apply(this, arguments);
            };
        }();

        if (editor) {
            changePath();
        }
    }, [path]);

    (0, _react.useEffect)(function () {
        if (editor) editor.updateOptions(props.options);
    }, [options]);

    (0, _react.useEffect)(function () {
        if (editor) editor.layout();
    }, [width, height]);

    var style = {
        width: width,
        height: height
    };
    return _react2.default.createElement("div", {
        ref: containerElement,
        style: style,
        className: "react-monaco-editor-container"
    });
}

var edOptions = {
    lineNumbers: 'on',
    selectOnLineNumbers: true,
    autoIndent: true,
    formatOnType: true,
    lineDecorationsWidth: 10,
    fontLigatures: true,
    folding: false,
    contextmenu: false,
    fontSize: "14px",
    fontFamily: "'Dank Mono', 'Fira Code', Monaco, monospace",
    scrollBeyondLastLine: false,
    scrollBeyondLastColumn: 2,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: false,
    minimap: {
        enabled: false
    }
};

MonacoEditor.propTypes = {
    width: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    height: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    value: _propTypes2.default.string,
    defaultValue: _propTypes2.default.string,
    path: _propTypes2.default.string,
    theme: _propTypes2.default.string,
    options: _propTypes2.default.object,
    editorDidMount: _propTypes2.default.func,
    onChange: _propTypes2.default.func
};

MonacoEditor.defaultProps = {
    width: "100%",
    height: "94vh",
    value: null,
    defaultValue: "",
    path: "/style.css",
    theme: null,
    options: edOptions,
    editorDidMount: noop,
    onChange: noop
};

exports.default = MonacoEditor;