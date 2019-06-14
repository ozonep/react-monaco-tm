"use strict";
import { Registry } from 'vscode-textmate';

export class MonacoThemeRegistry {
    static themes = new Map();

    static getTheme(name) {
        return this.themes.get(name);
    }

    static register(json, includes, givenName, monacoBase) {
        const name = givenName || json.name;
        const result = {
            name,
            base: monacoBase || 'vs',
            inherit: true,
            colors: {},
            rules: [],
            settings: []
        };
        if (this.themes.has(name)) {
            return this.themes.get(name);
        }
        this.themes.set(name, result);
        if (typeof json.include !== 'undefined') {
            if (!includes || !includes[json.include]) {
                console.error(`Couldn't resolve includes theme ${json.include}.`);
            } else {
                const parentTheme = this.register(includes[json.include], includes);
                Object.assign(result.colors, parentTheme.colors);
                result.rules.push(...parentTheme.rules);
                result.settings.push(...parentTheme.settings);
            }
        }
        if (json.tokenColors) {
            result.settings.push(...json.tokenColors);
        }
        if (json.colors) {
            Object.assign(result.colors, json.colors);
            result.encodedTokensColors = Object.keys(result.colors).map(key => result.colors[key]);
        }
        if (monacoBase && givenName) {
            for (const setting of result.settings) {
                this.transform(setting, rule => result.rules.push(rule));
            }
            const reg = new Registry();
            reg.setTheme(result);
            result.encodedTokensColors = reg.getColorMap();
            result.encodedTokensColors[0] = null;
            if (result.colors && result.colors['editor.foreground']) {
                result.encodedTokensColors[1] = result.colors['editor.foreground'];
            }
            if (result.colors && result.colors['editor.background']) {
                result.encodedTokensColors[2] = result.colors['editor.background'];
            }
            monaco.editor.defineTheme(givenName, result);
        }
        return result;
    }

    static transform(tokenColor, acceptor) {
        if (typeof tokenColor.scope === 'undefined') {
            tokenColor.scope = [''];
        } else if (typeof tokenColor.scope === 'string') {
            tokenColor.scope = [tokenColor.scope];
        }
        for (const scope of tokenColor.scope) {
            const settings = Object.keys(tokenColor.settings).reduce((previous, current) => {
                let value = tokenColor.settings[current];
                if (typeof value === typeof '') {
                    value = value.replace(/^\#/, '').slice(0, 6);
                }
                previous[current] = value;
                return previous;
            }, {});
            acceptor({
                ...settings, token: scope
            });
        }
    }
}


export const SINGLETON = new MonacoThemeRegistry();
export const DARK_DEFAULT_THEME = SINGLETON.register(require('../../../data/monaco-themes/vscode/dark_plus.json'), {
    './dark_defaults.json': require('../../../data/monaco-themes/vscode/dark_defaults.json'),
    './dark_vs.json': require('../../../data/monaco-themes/vscode/dark_vs.json')
}, 'dark-plus', 'vs-dark').name;
export const DARK_SCICODE_THEME = SINGLETON.register(require('../../../data/monaco-themes/vscode/dark_plus.json'), {
    './dark_defaults.json': require('../../../data/monaco-themes/vscode/dark_defaults.json'),
    './dark_vs.json': require('../../../data/monaco-themes/vscode/dark_vs.json')
}, 'one-dark', 'vs-dark').name;