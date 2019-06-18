export const grammars = [
  {
    "language": "css",
    "scopeName": "source.css",
    "path": "grammars/tmGrammars/css.json"
  },
  {
    "language": "html",
    "scopeName": "text.html.basic",
    "path": "grammars/tmGrammars/html.json",
    "embeddedLanguages": {
      "text.html": "html",
      "source.css": "css",
      "source.js": "javascript",
      "source.python": "python"
    }
  },
  {
    "language": "javascript",
    "scopeName": "source.js",
    "path": "grammars/tmGrammars/javascript.json"
  },
  {
    "language": "json",
    "scopeName": "source.json",
    "path": "grammars/tmGrammars/json.json"
  },
  {
    "language": "python",
    "scopeName": "source.python",
    "path": "grammars/tmGrammars/python.json"
  },
  {
    "language": "typescript",
    "scopeName": "source.ts",
    "path": "grammars/tmGrammars/typescript.json"
  },
  {
    "language": "typescriptreact",
    "scopeName": "source.tsx",
    "path": "grammars/tmGrammars/typescript.json"
  }
];

export const languages = ["css", "html", "javascriptreact", "javascript", "json", "python", "typescript", "typescriptreact"];