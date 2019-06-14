"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var grammars = exports.grammars = [{
  "language": "css",
  "scopeName": "source.css",
  "path": "/grammars/css.json.tmLanguage"
}, {
  "language": "html",
  "scopeName": "text.html.basic",
  "path": "/grammars/html.json.tmLanguage",
  "embeddedLanguages": {
    "text.html": "html",
    "source.css": "css",
    "source.js": "javascript",
    "source.python": "python"
  }
}, {
  "language": "javascript",
  "scopeName": "source.js",
  "path": "/grammars/javaScript.json.tmLanguage"
}, {
  "language": "json",
  "scopeName": "source.json",
  "path": "/grammars/json.json.tmLanguage"
}, {
  "language": "python",
  "scopeName": "source.python",
  "path": "/grammars/python.json.tmLanguage"
}, {
  "language": "typescript",
  "scopeName": "source.ts",
  "path": "/grammars/typescript.tmLanguage.json"
}, {
  "language": "typescriptreact",
  "scopeName": "source.tsx",
  "path": "/grammars/typescript.tmLanguage.json"
}];

var languages = exports.languages = ["css", "html", "javascriptreact", "javascript", "json", "python", "typescript", "typescriptreact"];