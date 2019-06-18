'use strict';
import Filer from 'filer';

let path = Filer.Path;

export class Resolver {
    constructor(grammars, languages, onigLibPromise) {
        this._grammars = grammars;
        this._languages = languages;
        this._onigLibPromise = onigLibPromise;
        this.language2id = Object.create(null);
        this._lastLanguageId = 0;
        this._id2language = [];
        for (let i = 0; i < this._languages.length; i++) {
            let languageId = ++this._lastLanguageId;
            this.language2id[this._languages[i].id] = languageId;
            this._id2language[languageId] = this._languages[i].id;
        }
    }
    getOnigLib() {
        return this._onigLibPromise;
    }
    findLanguageByExtension(fileExtension) {
        for (let i = 0; i < this._languages.length; i++) {
            let language = this._languages[i];
            if (!language.extensions) {
                continue;
            }
            for (let j = 0; j < language.extensions.length; j++) {
                let extension = language.extensions[j];
                if (extension === fileExtension) {
                    return language.id;
                }
            }
        }
        return null;
    }
    findScopeByFilename(filename) {
        let language = this.findLanguageByExtension(path.extname(filename));
        if (language) {
            let grammar = this.findGrammarByLanguage(language);
            if (grammar) {
                return grammar.scopeName;
            }
        }
        return null;
    }
    findGrammarByLanguage(language) {
        for (let i = 0; i < this._grammars.length; i++) {
            let grammar = this._grammars[i];
            if (grammar.language === language) {
                return grammar;
            }
        }
        throw new Error('Could not findGrammarByLanguage for ' + language);
    }
    loadGrammar(scopeName) {
        for (let i = 0; i < this._grammars.length; i++) {
            let grammar = this._grammars[i];
            if (grammar.scopeName === scopeName) {
                if (!grammar.grammar) {
                    grammar.grammar = require(`../../${grammar.path}`);
                }
                return grammar.grammar;
            }
        }
        return null;
    }
}
