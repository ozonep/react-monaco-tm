'use strict';
import { StackElementMetadata } from '../grammar';
export function tokenizeWithTheme(theme, colorMap, fileContents, grammar) {
    let lines = fileContents.split(/\r\n|\r|\n/);
    let ruleStack = null;
    let actual = [];
    let actualLen = 0;
    for (let i = 0, len = lines.length; i < len; i++) {
        let line = lines[i];
        let resultWithScopes = grammar.tokenizeLine(line, ruleStack);
        let tokensWithScopes = resultWithScopes.tokens;
        let result = grammar.tokenizeLine2(line, ruleStack);
        let tokensLength = result.tokens.length / 2;
        let tokensWithScopesIndex = 0;
        for (let j = 0; j < tokensLength; j++) {
            let startIndex = result.tokens[2 * j];
            let nextStartIndex = j + 1 < tokensLength ? result.tokens[2 * j + 2] : line.length;
            let tokenText = line.substring(startIndex, nextStartIndex);
            if (tokenText === '') {
                continue;
            }
            let metadata = result.tokens[2 * j + 1];
            let foreground = StackElementMetadata.getForeground(metadata);
            let foregroundColor = colorMap[foreground];
            let explanation = [];
            let tmpTokenText = tokenText;
            while (tmpTokenText.length > 0) {
                let tokenWithScopes = tokensWithScopes[tokensWithScopesIndex];
                let tokenWithScopesText = line.substring(tokenWithScopes.startIndex, tokenWithScopes.endIndex);
                tmpTokenText = tmpTokenText.substring(tokenWithScopesText.length);
                explanation.push({
                    content: tokenWithScopesText,
                    scopes: explainThemeScopes(theme, tokenWithScopes.scopes)
                });
                tokensWithScopesIndex++;
            }
            actual[actualLen++] = {
                content: tokenText,
                color: foregroundColor,
                explanation: explanation
            };
        }
        ruleStack = result.ruleStack;
    }
    return actual;
}
function explainThemeScopes(theme, scopes) {
    let result = [];
    for (let i = 0, len = scopes.length; i < len; i++) {
        let parentScopes = scopes.slice(0, i);
        let scope = scopes[i];
        result[i] = {
            scopeName: scope,
            themeMatches: explainThemeScope(theme, scope, parentScopes)
        };
    }
    return result;
}
function matchesOne(selector, scope) {
    let selectorPrefix = selector + '.';
    return selector === scope || scope.substring(0, selectorPrefix.length) === selectorPrefix;

}
function matches(selector, selectorParentScopes, scope, parentScopes) {
    if (!matchesOne(selector, scope)) {
        return false;
    }
    let selectorParentIndex = selectorParentScopes.length - 1;
    let parentIndex = parentScopes.length - 1;
    while (selectorParentIndex >= 0 && parentIndex >= 0) {
        if (matchesOne(selectorParentScopes[selectorParentIndex], parentScopes[parentIndex])) {
            selectorParentIndex--;
        }
        parentIndex--;
    }
    return selectorParentIndex === -1;

}
function explainThemeScope(theme, scope, parentScopes) {
    let result = [], resultLen = 0;
    for (let i = 0, len = theme.settings.length; i < len; i++) {
        let setting = theme.settings[i];
        let selectors;
        if (typeof setting.scope === 'string') {
            selectors = setting.scope.split(/,/).map(scope => scope.trim());
        }
        else if (Array.isArray(setting.scope)) {
            selectors = setting.scope;
        }
        else {
            continue;
        }
        for (let j = 0, lenJ = selectors.length; j < lenJ; j++) {
            let rawSelector = selectors[j];
            let rawSelectorPieces = rawSelector.split(/ /);
            let selector = rawSelectorPieces[rawSelectorPieces.length - 1];
            let selectorParentScopes = rawSelectorPieces.slice(0, rawSelectorPieces.length - 1);
            if (matches(selector, selectorParentScopes, scope, parentScopes)) {
                result[resultLen++] = setting;
                j = lenJ;
            }
        }
    }
    return result;
}
