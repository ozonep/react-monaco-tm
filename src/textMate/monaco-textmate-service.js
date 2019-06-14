"use strict";
import { Registry, parseRawGrammar } from 'vscode-textmate';
import { getEncodedLanguageId } from './textmate-contribution';
import { createTextmateTokenizer, TokenizerOption } from './textmate-tokenizer';
import { TextmateRegistry } from './textmate-registry';
import { MonacoThemeRegistry, DARK_SCICODE_THEME } from './monaco-theme-registry';
import {onigasmPromise} from './monaco-textmate-frontend-bindings';



export class MonacoTextmateService {
    onigasmPromise = onigasmPromise();
    initialize() {
        for (const grammarProvider of this.grammarProviders.getContributions()) {
            try {
                grammarProvider.registerTextmateLanguage(TextmateRegistry);
            } catch (err) {
                console.error(err);
            }
        }
        this.grammarRegistry = new Registry({
            getOnigLib: () => this.onigasmPromise,
            theme: MonacoThemeRegistry.getTheme(DARK_SCICODE_THEME),
            loadGrammar: async (scopeName) => {
                const provider = TextmateRegistry.getProvider(scopeName);
                if (provider) {
                    const definition = await provider.getGrammarDefinition();
                    let rawGrammar;
                    if (typeof definition.content === 'string') {
                        rawGrammar = parseRawGrammar(definition.content, 'grammar.json');
                    } else {
                        rawGrammar = definition.content;
                    }
                    return rawGrammar;
                }
                return undefined;
            },
            getInjections: (scopeName) => {
                const provider = TextmateRegistry.getProvider(scopeName);
                if (provider && provider.getInjections) {
                    return provider.getInjections(scopeName);
                }
                return [];
            }
        });
        const theme = DARK_SCICODE_THEME;
        // if (theme) this.grammarRegistry.setTheme(theme);
        const registered = new Set();
        for (const { id } of monaco.languages.getLanguages()) {
            if (!registered.has(id)) {
                monaco.languages.onLanguage(id, () => this.activateLanguage(id));
                registered.add(id);
            }
        }
    }
    async activateLanguage(languageId) {
        const scopeName = TextmateRegistry.getScope(languageId);
        if (!scopeName) return;
        const provider = TextmateRegistry.getProvider(scopeName);
        if (!provider) return;
        const configuration = TextmateRegistry.getGrammarConfiguration(languageId);
        const initialLanguage = getEncodedLanguageId(languageId);
        await this.onigasmPromise;
        try {
            const grammar = await this.grammarRegistry.loadGrammarWithConfiguration(scopeName, initialLanguage, configuration);
            const options = configuration.tokenizerOption ? configuration.tokenizerOption : TokenizerOption;
            monaco.languages.setTokensProvider(languageId, createTextmateTokenizer(grammar, options));
        } catch (error) {
            this.logger.warn('No grammar for this language id', languageId, error);
        }
    }
}