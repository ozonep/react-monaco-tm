<h1 align="center">Monaco Editor as React component with TextMate grammar support</h1>

<div align="center">

# WIP! 
# It's in testing phase. 

[Monaco Editor](https://github.com/Microsoft/monaco-editor) for React.

<h4 align="center">react-monaco-tm</h4>



[npm-url]: https://npmjs.org/package/react-monaco-hooks
[downloads-image]: http://img.shields.io/npm/dm/react-monaco-editor.svg
[npm-image]: http://img.shields.io/npm/v/react-monaco-editor.svg

</div>

## Installation

```bash
yarn add react-monaco-hooks
```

## Using with Webpack

```js
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import MonacoEditor from 'react-monaco-tm';

function App(props) {
  const [code, setCode] = useState('// type your code...');
   
  const editorDidMount = (editor, monaco) => {
    console.log('editorDidMount', editor);
    editor.focus();
  };
  
  const onChange = (newValue, e) => {
    console.log('onChange', newValue, e);
  };
  
  const options = {
    selectOnLineNumbers: true
  };
  
  return (
    <MonacoEditor
      width="800"
      height="600"
      theme="vs-dark"
      value={code}
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

Add the [Monaco Webpack plugin](https://github.com/Microsoft/monaco-editor-webpack-plugin) `monaco-editor-webpack-plugin` to your `webpack.config.js`:

```js
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin-updated');
module.exports = {
  plugins: [
    new MonacoWebpackPlugin()
  ]
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
