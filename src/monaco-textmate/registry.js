"use strict";
import { createGrammar, collectIncludedScopes } from './grammar';
import { getOnigasm } from './onigLibs';

export class SyncRegistry {
    constructor(theme, onigLibPromise) {
        this._theme = theme;
        this._grammars = {};
        this._rawGrammars = {};
        this._injectionGrammars = {};
        this._onigLibPromise = onigLibPromise || getOnigasm();
    }
    setTheme(theme) {
        this._theme = theme;
        Object.keys(this._grammars).forEach((scopeName) => {
            let grammar = this._grammars[scopeName];
            grammar.onDidChangeTheme();
        });
    }
    getColorMap() {
        return this._theme.getColorMap();
    }
    addGrammar(grammar, injectionScopeNames) {
        this._rawGrammars[grammar.scopeName] = grammar;
        let includedScopes = {};
        collectIncludedScopes(includedScopes, grammar);
        if (injectionScopeNames) {
            this._injectionGrammars[grammar.scopeName] = injectionScopeNames;
            injectionScopeNames.forEach(scopeName => {
                includedScopes[scopeName] = true;
            });
        }
        return Object.keys(includedScopes);
    }
    lookup(scopeName) {
        return this._rawGrammars[scopeName];
    }
    injections(targetScope) {
        return this._injectionGrammars[targetScope];
    }
    getDefaults() {
        return this._theme.getDefaults();
    }
    themeMatch(scopeName) {
        return this._theme.match(scopeName);
    }
    async grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes) {
        if (!this._grammars[scopeName]) {
            let rawGrammar = this._rawGrammars[scopeName];
            if (!rawGrammar) {
                return null;
            }
            this._grammars[scopeName] = createGrammar(rawGrammar, initialLanguage, embeddedLanguages, tokenTypes, this, await this._onigLibPromise);
        }
        return this._grammars[scopeName];
    }
}