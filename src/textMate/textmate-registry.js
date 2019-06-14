"use strict";

export class TextmateRegistry {
    static scopeToProvider = new Map();
    static languageToConfig = new Map();
    static languageIdToScope = new Map();

    static registerTextmateGrammarScope(scope, description) {
        if (this.scopeToProvider.has(scope)) console.warn(new Error(`a registered grammar provider for '${scope}' scope is overridden`));
        this.scopeToProvider.set(scope, description);
    }
    static getProvider(scope) {
        return this.scopeToProvider.get(scope);
    }
    static mapLanguageIdToTextmateGrammar(languageId, scope) {
        const existingScope = this.getScope(languageId);
        if (typeof existingScope === 'string') console.warn(new Error(`'${languageId}' language is remapped from '${existingScope}' to '${scope}' scope`));
        this.languageIdToScope.set(languageId, scope);
    }
    static getScope(languageId) {
        return this.languageIdToScope.get(languageId);
    }
    static getLanguageId(scope) {
        for (const key of this.languageIdToScope.keys()) {
            if (this.languageIdToScope.get(key) === scope) return key;
        }
        return undefined;
    }
    static registerGrammarConfiguration(languageId, config) {
        if (this.languageToConfig.has(languageId)) console.warn(new Error(`a registered grammar configuration for '${languageId}' language is overridden`));
        this.languageToConfig.set(languageId, config);
    }
    static getGrammarConfiguration(languageId) {
        return this.languageToConfig.get(languageId) || {};
    }
}