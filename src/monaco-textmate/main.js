"use strict";
import { SyncRegistry } from './registry';
import { Theme } from './theme';
import { StackElement } from './grammar';


export class Registry {
    constructor(locator = { loadGrammar: () => null }) {
        this._locator = locator;
        this._syncRegistry = new SyncRegistry(Theme.createFromRawTheme(locator.theme), locator.getOnigLib && locator.getOnigLib());
    }
    setTheme(theme) {
        this._syncRegistry.setTheme(Theme.createFromRawTheme(theme));
    }
    getColorMap() {
        return this._syncRegistry.getColorMap();
    }
    loadGrammarWithEmbeddedLanguages(initialScopeName, initialLanguage, embeddedLanguages) {
        return this.loadGrammarWithConfiguration(initialScopeName, initialLanguage, { embeddedLanguages });
    }
    loadGrammarWithConfiguration(initialScopeName, initialLanguage, configuration) {
        return this._loadGrammar(initialScopeName, initialLanguage, configuration.embeddedLanguages, configuration.tokenTypes);
    }
    loadGrammar(initialScopeName) {
        return this._loadGrammar(initialScopeName, 0, null, null);
    }
    async _loadGrammar(initialScopeName, initialLanguage, embeddedLanguages, tokenTypes) {
        let remainingScopeNames = [initialScopeName];
        let seenScopeNames = {};
        seenScopeNames[initialScopeName] = true;
        while (remainingScopeNames.length > 0) {
            let scopeName = remainingScopeNames.shift();
            if (this._syncRegistry.lookup(scopeName)) {
                continue;
            }
            let grammar = await this._locator.loadGrammar(scopeName);
            if (!grammar) {
                if (scopeName === initialScopeName) {
                    throw new Error(`No grammar provided for <${initialScopeName}`);
                }
            }
            else {
                let injections = (typeof this._locator.getInjections === 'function') && this._locator.getInjections(scopeName);
                let deps = this._syncRegistry.addGrammar(grammar, injections);
                deps.forEach((dep) => {
                    if (!seenScopeNames[dep]) {
                        seenScopeNames[dep] = true;
                        remainingScopeNames.push(dep);
                    }
                });
            }
        }
        return this.grammarForScopeName(initialScopeName, initialLanguage, embeddedLanguages, tokenTypes);
    }
    addGrammar(rawGrammar, injections = [], initialLanguage = 0, embeddedLanguages = null) {
        this._syncRegistry.addGrammar(rawGrammar, injections);
        return this.grammarForScopeName(rawGrammar.scopeName, initialLanguage, embeddedLanguages);
    }
    grammarForScopeName(scopeName, initialLanguage = 0, embeddedLanguages = null, tokenTypes = null) {
        return this._syncRegistry.grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes);
    }
}
export const INITIAL = StackElement.NULL;