/* eslint-disable */
import * as monaco from 'monaco-editor-no-lang/esm/vs/editor/editor.main';
import PropTypes from "prop-types";
import React, {useEffect, useRef} from "react";
import {processSize} from "./utils";
import {liftOff} from './grammars/configure-tokenizer';
import {langConfigs} from "./grammars/langConfigurations";


const noop = () => {};

let editor = null;
let langsConfigured = false;

function Configurator() {
    langConfigs(monaco);
    langsConfigured = true;
}

!langsConfigured && Configurator();


monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
});

const compilerDefaults = {
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
    newLine: monaco.languages.typescript.NewLineKind.LineFeed,
};

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerDefaults);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerDefaults);

const findModel = (path) => monaco.editor.getModels().find(model => model.uri.path === `${path}`);
const editorStates = new Map();
const extraLibs = new Map();


function MonacoEditor(props) {
    const containerElement = useRef(null);
    const {options, width, height, path, theme} = props;
    let value = props.value !== null ? props.value : props.defaultValue;
    let typingsWorker;
    let subscription;

    // const usePrevious = (value) => {
    //     const ref = useRef();
    //     useEffect(() => {
    //         ref.current = value;
    //     });
    //     return ref.current;
    // };

    const updateDimensions = () => {
        editor.layout();
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

    const editorDidMount = (editor) => {
        window.addEventListener("resize", updateDimensions);
        // props.editorDidMount(model);
        monaco.languages.typescript.typescriptDefaults.setMaximumWorkerIdleTime(-1);
        monaco.languages.typescript.javascriptDefaults.setMaximumWorkerIdleTime(-1);
        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    };

    const initMonaco = async () => {
        typingsWorker = new Worker('./workers/typings.worker.js', {type: 'module',});
        typingsWorker.addEventListener('message', ({data}) => addTypings(data));
        typingsWorker.postMessage({
            name: 'react',
            version: '16.8.6'
        });
        if (containerElement.current) {
            editor = monaco.editor.create(containerElement.current, {
                model: null,
                ...options
            });
            const {default: data} = await import('./themes/oneDarkMonaco');
            monaco.editor.defineTheme('one-dark', data);
            monaco.editor.setTheme('one-dark');
            await editorDidMount(editor);
            initializeFile(path, value);
        }
    };

    const destroyMonaco = () => {
        if (typeof editor !== "undefined") {
            window.removeEventListener("resize", updateDimensions);
            typingsWorker && typingsWorker.terminate();
            subscription && subscription.dispose();
            editor.dispose();
        }
    };

    const initializeFile = (path, value) => {
        let model = findModel(path);
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
            model = monaco.editor.createModel(
                value,
                undefined,
                monaco.Uri.from({scheme: 'file', path})
            );
            console.log('MODEL CREATED');
            model.updateOptions({
                tabSize: 2,
                insertSpaces: true,
            });
        }
    };

    subscription = editor && editor.onDidChangeModelContent(() => {
        let model = editor.getModel();
        if (model) {
            const value = model.getValue();
            if (value !== props.value) {
                props.onChange(value, editor);
            }
        }
    });

    const addTypings = ({typings}) => {
        Object.keys(typings).forEach(path => {
            let extraLib = extraLibs.get(path);
            if (extraLib) {
                extraLib.js && extraLib.js.dispose();
                extraLib.ts && extraLib.ts.dispose();
            }
            extraLib = monaco.languages.typescript.javascriptDefaults.addExtraLib(
                typings[path],
                monaco.Uri.from({scheme: 'file', path}).toString()
            );
            extraLibs.set(path, extraLib);
        });
    };

    const openFile = async (path, value) => {
        initializeFile(path, value);
        let model = findModel(path);
        if (editor && model) {
            await editor.setModel(model);
            // const editorState = editorStates.get(path);
            // if (editorState) editor.restoreViewState(editorState);
            // editor.focus();
        }
    };

    useEffect(() => {
        initMonaco();
        return () => destroyMonaco();
    }, []);

    useEffect(() => {
            if (editor && editor.getModel()) {
                const model = editor.getModel();
                editor.executeEdits(null, [
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
                console.log('THIS IS LANG', editor.getModel().getModeId());
                await liftOff(monaco, editor.getModel().getModeId(), editor);

            }

            if (editor) {
                changePath()
            }
        },
        [path]
    );

    useEffect(() => {
            if (editor) editor.updateOptions(props.options);
        },
        [options]
    );

    useEffect(() => {
            if (editor) editor.layout();
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
    height: "94vh",
    value: null,
    defaultValue: "",
    path: "/style.css",
    theme: null,
    options: edOptions,
    editorDidMount: noop,
    onChange: noop
};


export default MonacoEditor;