"use strict";
import { Registry } from 'vscode-textmate';
import { commonLangIds, commonLangAliases, getLangRegistrations } from './lang';
import { Resolver } from './resolver';
import { getOnigasm } from './onigLibs';
import { tokenizeWithTheme } from './themedTokenizer';
import { renderToHtml } from './renderer';

export async function getHighlighter(options) {
    let theme;
    if (options.theme.name) theme = options.theme;
    let langs = [
        ...commonLangIds,
        ...commonLangAliases
    ];
    const langRegistrations = getLangRegistrations(langs);
    const s = new Shiki(theme, langRegistrations);
    return await s.getHighlighter();
}

class Shiki {
    constructor(theme, langs) {
        this._resolver = new Resolver(langs, getOnigasm(), 'onigasm');
        this._registry = new Registry(this._resolver);
        this._registry.setTheme(theme);
        this._theme = theme;
        this._colorMap = this._registry.getColorMap();
        this._langs = langs;
    }
    async getHighlighter() {
        const ltog = {};
        await Promise.all(this._langs.map(async (l) => {
            const grammar = await this._registry.loadGrammar(l.scopeName);
            ltog[l.id] = grammar;
            l.aliases.forEach(la => {
                ltog[la] = grammar;
            });
        }));
        return {
            codeToThemedTokens: (code, lang) => {
                return tokenizeWithTheme(this._theme, this._colorMap, code, ltog[lang]);
            },
            codeToHtml: (code, lang) => {
                const tokens = tokenizeWithTheme(this._theme, this._colorMap, code, ltog[lang]);
                return renderToHtml(tokens, {
                    bg: this._theme.bg
                });
            }
        };
    }
}
