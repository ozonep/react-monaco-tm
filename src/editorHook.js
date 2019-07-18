/* eslint-disable */
import {monaco} from './utils/index';
import PropTypes from "prop-types";
import React, {useEffect, useRef, useState} from "react";
import {processSize} from "./utils";
import {liftOff} from './grammars/configure-tokenizer';
import {langConfigs} from "./grammars/langConfigurations";
import config from './themes';

function usePrevious(value) {
    const ref = useRef(null);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const noop = () => {
};

let langsConfigured = false;

function Configurator(monaco) {
    langConfigs(monaco);
    langsConfigured = true;
}


let overrideLangauges = [
    'css',
    'html',
    'javascript',
    'javascriptreact',
    'python'
];


const findModel = (path, monaco) => monaco.editor.getModels().find(model => model.uri.path === `${path}`);
const editorStates = new Map();
const extraLibs = new Map();


function MonacoEditor(props) {
    const containerElement = useRef(null);
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const {options, width, height, path} = props;
    let value = props.value !== null ? props.value : props.defaultValue;
    let typingsWorker;
    let subscription;
    const prevPath = usePrevious(path);

    const updateDimensions = () => {
        editorRef.current.layout();
    };

    const removePath = (path) => {
        editorStates.delete(path);
        const model = findModel(path);
        model && model.dispose();
    };

    // const renamePath = (oldPath, newPath) => {
    //     const selection = editorStates.get(oldPath);
    //     editorStates.delete(oldPath);
    //     editorStates.set(newPath, selection);
    //     removePath(oldPath);
    // };

    const editorDidMount = () => {
        monacoRef.current.languages.getLanguages().forEach(function (lang) {
            if (overrideLangauges.includes(lang.id)) {
                lang.loader = function () {
                    return {
                        then: function () {
                        }
                    };
                };
            }
        });
        window.addEventListener("resize", updateDimensions);
        monacoRef.current.languages.typescript.typescriptDefaults.setMaximumWorkerIdleTime(-1);
        monacoRef.current.languages.typescript.javascriptDefaults.setMaximumWorkerIdleTime(-1);
        monacoRef.current.languages.typescript.typescriptDefaults.setEagerModelSync(true);
        monacoRef.current.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        !langsConfigured && Configurator(monacoRef.current);
        const compilerDefaults = {
            jsxFactory: 'React.createElement',
            reactNamespace: 'React',
            jsx: monacoRef.current.languages.typescript.JsxEmit.React,
            target: monacoRef.current.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
            moduleResolution: monacoRef.current.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monacoRef.current.languages.typescript.ModuleKind.System,
            experimentalDecorators: true,
            noEmit: true,
            allowJs: true,
            typeRoots: ['node_modules/@types'],
            newLine: monacoRef.current.languages.typescript.NewLineKind.LineFeed,
        };
        monacoRef.current.languages.typescript.typescriptDefaults.setCompilerOptions(compilerDefaults);
        monacoRef.current.languages.typescript.javascriptDefaults.setCompilerOptions(compilerDefaults);
        monacoRef.current.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });
        monacoRef.current.editor.defineTheme('one-dark', config.theme['one-dark']);
        monacoRef.current.editor.setTheme('one-dark');
    };

    const initMonaco = async () => {
        typingsWorker = new Worker('./workers/typings.worker.js', {type: 'module',});
        typingsWorker.addEventListener('message', ({data}) => addTypings(data));
        typingsWorker.postMessage({
            name: 'react',
            version: '16.8.6'
        });
        if (containerElement.current) {
            editorRef.current = monacoRef.current.editor.create(containerElement.current, {
                model: null,
                ...options
            });
            await editorDidMount();
            initializeFile(path, value);
        }
    };

    const destroyMonaco = () => {
        if (typeof monacoRef.current !== "undefined") {
            window.removeEventListener("resize", updateDimensions);
            typingsWorker && typingsWorker.terminate();
            subscription && subscription.dispose();
            monacoRef.current.dispose();
        }
    };

    const initializeFile = (path, value) => {
        let model = findModel(path, monacoRef.current);
        console.log("INITIALIZATION");
        if (model) {
            console.log("MODEL_EXISTS");
            model.pushEditOperations(
                [],
                [
                    {
                        range: model.getFullModelRange(),
                        text: value,
                    },
                ]
            );
        } else {
            console.log("MODEL_DOESN'T EXIST");
            model = monacoRef.current.editor.createModel(
                value,
                undefined,
                monacoRef.current.Uri.from({scheme: 'file', path})
            );
            console.log('MODEL CREATED');
            model.updateOptions({
                tabSize: 2,
                insertSpaces: true,
            });
        }
    };

    const addTypings = ({typings}) => {
        Object.keys(typings).forEach(path => {
            let extraLib = extraLibs.get(path);
            if (extraLib) {
                extraLib.js && extraLib.js.dispose();
                extraLib.ts && extraLib.ts.dispose();
            }
            extraLib = monacoRef.current.languages.typescript.javascriptDefaults.addExtraLib(
                typings[path],
                monacoRef.current.Uri.from({scheme: 'file', path}).toString()
            );
            extraLibs.set(path, extraLib);
        });
    };

    const openFile = async (path, value) => {
        initializeFile(path, value);
        let model = findModel(path, monacoRef.current);
        if (editorRef.current && model) {
            console.log("Opening file!");
            await editorRef.current.setModel(model);
            // const editorState = editorStates.get(path);
            // if (editorState) editor.restoreViewState(editorState);
            editorRef.current.focus();
        }
    };

    useEffect(() => {
        monaco
            .init()
            .then(monaco => (monacoRef.current = monaco) && initMonaco())
            .then(() => {
                async function changePath() {
                    console.log('PATH CHANGED');
                    // editorStates.set(prevPath, editor.saveViewState());
                    await openFile(path, value);
                    console.log('THIS IS LANG', editorRef.current.getModel().getModeId());
                    await liftOff(monacoRef.current, editorRef.current.getModel().getModeId(), editorRef.current);
                }
                changePath().then(() => {
                    subscription = editorRef.current && editorRef.current.onKeyUp(() => {
                        let model = editorRef.current.getModel();
                        let uriPath = model.uri.path;
                        if (model && uriPath) {
                            const value = model.getValue();
                            if (value !== props.value) {
                                props.onChange(value, uriPath);
                            }
                        }
                    });
                    console.log("subscribing!");
                });

            });
        return () => destroyMonaco();
    }, []);

    useEffect(() => {
            if (editorRef.current && editorRef.current.getModel()) {
                const model = editorRef.current.getModel();
                editorRef.current.executeEdits(null, [
                    {
                        range: model.getFullModelRange(),
                        text: value,
                    },
                ]);
            }
        },
        [value]
    );

    // const prevPath = usePrevious(path);
    useEffect(() => {
            async function changePath() {
                console.log('PATH CHANGED');
                // editorStates.set(prevPath, editor.saveViewState());
                await openFile(path, value);
                console.log('THIS IS LANG', editorRef.current.getModel().getModeId());
                await liftOff(monacoRef.current, editorRef.current.getModel().getModeId(), editorRef.current);
            }

            if (editorRef.current) {
                changePath()
            }
        },
        [path]
    );

    useEffect(() => {
            if (editorRef.current) editorRef.current.updateOptions(props.options);
        },
        [options]
    );

    useEffect(() => {
            if (editorRef.current) editorRef.current.layout();
        },
        [width, height]
    );

    const style = {
        width,
        height
    };
    return (
        <div
            ref={containerElement}
            style={style}
            className="react-monaco-editor-container"
        />
    );
}

const edOptions = {
    lineNumbers: 'on',
    selectOnLineNumbers: true,
    autoIndent: true,
    formatOnType: true,
    formatOnPaste: true,
    lineDecorationsWidth: 10,
    fontLigatures: true,
    folding: false,
    contextmenu: false,
    fontSize: "14px",
    fontFamily: "'Fira Code', Monaco, monospace",
    scrollBeyondLastLine: false,
    scrollBeyondLastColumn: 2,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    wordWrap: "on",
    automaticLayout: false,
    stopRenderingLineAfter: 5000,
    minimap: {
        enabled: false
    }
};

MonacoEditor.propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    path: PropTypes.string,
    theme: PropTypes.string,
    options: PropTypes.object,
    editorDidMount: PropTypes.func,
    onChange: PropTypes.func
};

MonacoEditor.defaultProps = {
    width: "100%",
    height: "93vh",
    value: null,
    defaultValue: "",
    path: null,
    theme: null,
    options: edOptions,
    editorDidMount: noop,
    onChange: noop
};


export default MonacoEditor;