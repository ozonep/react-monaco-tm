"use strict";
import * as fs from 'fs'
import JSON5 from 'json5';

function loadJSONTheme(themePath) {
    const fileContents = fs.readFileSync(themePath, 'utf-8');
    return JSON5.parse(fileContents);
}

function toShikiTheme(rawTheme) {
    const shikiTheme = {
        ...rawTheme,
        bg: getThemeBg(rawTheme)
    };
    shikiTheme.settings = rawTheme.tokenColors;
    return shikiTheme;
}

export function loadTheme(themePath) {
    let theme = loadJSONTheme(themePath);
    return toShikiTheme(theme);
}

function getThemeBg(theme) {
    if (theme.colors && theme.colors['editor.background']) {
        return theme.colors['editor.background'];
    }
}