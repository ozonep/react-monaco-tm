<h1 align="center">Monaco Editor as React component with TextMate grammar support</h1>

<div align="center">

# WIP
# It's in testing phase. 

[Monaco Editor](https://github.com/Microsoft/monaco-editor) for React.

<h4 align="center">react-monaco-tm</h4>

<h4>Finally found some time to add proper Readme :) </h4>
<p>Monaco Editor I created for my private project.<br/>
Feel free to use & contribute.<br/>
You don't need "Monaco WebPack plugin" to use this package, 
but you still need "Craco" or similar package in case you are using CRA, 
because I rely on Web Worker (for fetching React typings) that is not supported by CRA as of now.
Currently, this package supports basic tokenization for all Monaco supported languages, but for:
<ul>
<li>CSS</li>
<li>HTML</li>
<li>JS (including JSX)</li>
<li>TS</li>
<li>JSON</li>
<li>Python</li>
</ul>
I added extended tokenization (the one we have in VS Code)
</p>

</div>

## Installation

```bash
npm install react-monaco-tm
```

## Using with Webpack

```js
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import MonacoEditor from 'react-monaco-tm';

function App(props) {
  const [code, setCode] = useState('// type your code...');
   
  const onChange = (newValue, selectedPath) => {
    console.log('onChange', newValue, selectedPath);
  };
  
  const options = {
      selectOnLineNumbers: true,
      autoIndent: true,
      formatOnType: true,
      formatOnPaste: true,
      lineDecorationsWidth: 10,
      fontLigatures: false,
      folding: false,
      contextmenu: false,
      fontSize: "14px",
      fontFamily: "'Fira Code', Monaco, monospace",
      scrollBeyondLastLine: false,
      scrollBeyondLastColumn: 2,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      automaticLayout: false,
      wordWrap: "on",
      stopRenderingLineAfter: 4000,
      minimap: {
          enabled: false
      }
}

  return (
    <MonacoEditor
      path={path}
      theme="one-dark"
      defaultValue={code}
      options={options}
      onChange={onChange}
      editorDidMount={editorDidMount}
    />
   );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```

Add the 'Worker Plugin' to your `craco.config.js`:
'wasm' rule is need for proper tokenization support with Webpack 4...

```js
const WorkerPlugin = require('worker-plugin');
module.exports = {
    webpack: {
        plugins: [
            new WorkerPlugin()
        ],
        configure: {
            module: {
                rules: [
                    {
                        test: /\.wasm$/,
                        type: "javascript/auto"
                    }
                ]
            }
        },
    }
};
```



## Properties

All the properties below are optional.

- `width` width of editor. Defaults to `100%`.
- `height` height of editor. Defaults to `100%`.
- `value` value of the auto created model in the editor.
- `defaultValue` the initial value of the auto created model in the editor.
- `language` the initial language of the auto created model in the editor.
- `theme` the theme of the editor
- `options` refer to [Monaco interface IEditorConstructionOptions](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html).
- `onChange(newValue, event)` an event emitted when the content of the current model has changed.
- `editorWillMount(monaco)` an event emitted before the editor mounted (similar to `componentWillMount` of React).
- `editorDidMount(editor, monaco)` an event emitted when the editor has been mounted (similar to `componentDidMount` of React).
- `context` allow to pass a different context then the global window onto which the monaco instance will be loaded. Useful if you want to load the editor in an iframe.


## Options for Monaco Editor instance:

Refer to [Monaco interface IEditor](https://github.com/microsoft/vscode/blob/master/src/vs/editor/common/config/editorOptions.ts).


## Events & Methods

Refer to [Monaco interface IEditor](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditor.html).

## Q & A

### I don't get syntax highlighting / autocomplete / validation.

Make sure to use the [Monaco Webpack plugin](https://github.com/Microsoft/monaco-editor-webpack-plugin) or follow the [instructions on how to load the ESM version of Monaco](https://github.com/Microsoft/monaco-editor/blob/master/docs/integrate-esm.md).


### How to get value of editor

```js
const model = monaco.editor.getModel();
const value = model.getValue();
```


### Available themes:
```
"vs",
"vs-dark",
"hc-black"
"one-dark" //One Dark Pro theme, default one
```
