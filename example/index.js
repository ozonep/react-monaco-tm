import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import MonacoEditor from 'react-monaco-tm';
import './example.css';

let editor;

function CodeEditor(props) {
  const [code, setCode] = useState('// type your code... \n');
  const [theme, setTheme] = useState('vs-dark');
  const [lang, setLang] = useState('css');

  const onChange = (newValue, e, monaco) => {
    console.log('onChange', newValue, e);
    setCode(newValue);
    editor = monaco;
  };

  const editorDidMount = (monaco) => {
    console.log('editorDidMount', monaco.getValue());
    editor = monaco;
  };

  const changeEditorValue = () => {
    if (editor) editor.setValue('// code changed! \n');
  };

  const changeBySetState = () => {
    setCode('// code changed by setState! \n');
  };

  const changeTheme = () => {
    setTheme('vs');
  };

  const changeLang = (lang) => {
    console.log('Pressing button to change lang');
    setLang(lang);
  };

  const options = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: false,
  };
  return (
    <div>
      <div>
        <button onClick={changeEditorValue} type="button">Change value</button>
        <button onClick={changeBySetState} type="button">Change by setState</button>
        <button onClick={changeTheme} type="button">Change theme</button>
      </div>
      <MonacoEditor
        height="700"
        path={'app/index.js'}
        value={code}
        options={options}
        onChange={onChange}
        theme={theme}
        editorDidMount={editorDidMount}
      />
    </div>
  );
}

const App = () => (
  <div>
    <h2>Monaco Editor Sample (controlled mode)</h2>
    <CodeEditor />
  </div>
);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
