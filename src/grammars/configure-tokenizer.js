import { wireTmGrammars } from './set-grammars';
import {Resolver} from "../monaco-textmate/tests/resolver";
import {grammars, languages} from '../monaco-textmate/grammars';
import {getOnigasm} from "../monaco-textmate/onigLibs";
import {Registry} from "../monaco-textmate/main";
// import {TextmateRegistry} from "../textMate/textmate-registry";

let languagesToRegister = [
  ["css", "source.css"],
  ["html", "text.html.basic"],
  ["javascript", "source.js"],
  ["javascript", "source.js.jsx"],
  ["json", "source.json"],
  ["python", "source.python"],
  ["typescript", "source.tsx"],
  ["typescript", "source.ts"]
];


let onigasmResolver = new Resolver(grammars, languages, getOnigasm());
let registry = new Registry(onigasmResolver);


export async function liftOff(monaco, languageId, editor) {
  let langId = languageId;
  console.log('langId', langId);
  if (languageId === 'plaintext') langId = 'javascript';
  const [, scope] = languagesToRegister.find(([id]) => id === langId);
  const oneGrammar = grammars.filter((grammar) => grammar.language === langId);
  await wireTmGrammars(monaco, registry, oneGrammar, langId, scope, editor);
}
