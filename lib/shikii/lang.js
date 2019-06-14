"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getLangRegistrations = getLangRegistrations;
var commonLangIds = exports.commonLangIds = ['css', 'html', 'jsx', 'javascript', 'json', 'python', 'typescript', 'tsx'];

var commonLangAliases = exports.commonLangAliases = ['htm', 'js', 'py', 'ts'];

var languages = exports.languages = [{
    id: 'css',
    scopeName: 'source.css',
    path: 'grammars/css.json.tmLanguage',
    aliases: []
}, {
    id: 'html',
    scopeName: 'text.html.basic',
    path: 'grammars/html.json.tmLanguage',
    aliases: ['htm']
}, {
    id: 'jsx',
    scopeName: 'source.js.jsx',
    path: 'grammars/JavaScript.json.tmLanguage',
    aliases: []
}, {
    id: 'javascript',
    scopeName: 'source.js',
    path: 'grammars/JavaScript.json.tmLanguage',
    aliases: ['js']
}, {
    id: 'json',
    scopeName: 'source.json',
    path: 'grammars/json.json.tmLanguage',
    aliases: []
}, {
    id: 'python',
    scopeName: 'source.python',
    path: 'grammars/python.json.tmLanguage',
    aliases: ['py']
}, {
    id: 'typescript',
    scopeName: 'source.ts',
    path: 'grammars/TypeScript.json.tmLanguage',
    aliases: ['ts']
}, {
    id: 'tsx',
    scopeName: 'source.tsx',
    path: 'grammars/TypeScript.json.tmLanguage',
    aliases: []
}];

function getLangRegistrations(langs) {
    var langRegistrationMap = {};
    languages.forEach(function (lang) {
        langRegistrationMap[lang.id] = lang;
        lang.aliases.forEach(function (alias) {
            langRegistrationMap[alias] = l;
        });
    });
    return langs.map(function (lang) {
        return langRegistrationMap[lang];
    });
}

// languages.forEach(l => {
//     l.path = path.resolve(__dirname, l.path)
// });