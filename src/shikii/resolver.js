'use strict';
import { parseRawGrammar } from 'vscode-textmate';
// const fs = require("fs");

export class Resolver {
    constructor(languages, onigLibPromise, onigLibName) {
        this.langMap = {};
        this.scopeToLangMap = {};
        this._languages = languages;
        this._onigLibPromise = onigLibPromise;
        this._onigLibName = onigLibName;
        this._languages.forEach(l => {
            this.langMap[l.id] = l;
            l.aliases.forEach(a => {
                this.langMap[a] = l;
            });
            this.scopeToLangMap[l.scopeName] = l;
        });
    }
    getOnigLib() {
        return this._onigLibPromise;
    }
    getOnigLibName() {
        return this._onigLibName;
    }
    async loadGrammar(scopeName) {
        const lang = this.scopeToLangMap[scopeName];
        if (!lang) {
            return null;
        }
        if (lang.grammar) {
            return lang.grammar;
        }
        const g = await readGrammarFromPath(lang.path);
        lang.grammar = g;
        return g;
    }
}
// function readGrammarFromPath(path) {
//     return new Promise((c, e) => {
//         fs.readFile(path, (error, content) => {
//             if (error) {
//                 e(error);
//             }
//             else {
//                 c(parseRawGrammar(content.toString(), path));
//             }
//         });
//     });
// }
