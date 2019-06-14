import {INITIAL} from '../monaco-textmate/main';

let langsInjected = false;

export class TokenizerState {
    constructor(ruleStack) {
        this.ruleStack = ruleStack;
    }
    clone() {
        return new TokenizerState(this.ruleStack);
    }
    equals(other) {
        return other instanceof TokenizerState && (other === this || other.ruleStack === this.ruleStack);
    }
}

export function wireTmGrammars(monaco, registry, grammars, langId, scope, editor) {
    return Promise.all(
        grammars.map(async gram => {
            const grammar = await registry.loadGrammar(scope);
            monaco.languages.setTokensProvider(langId, {
                getInitialState: () => new TokenizerState(INITIAL),
                tokenize: (line, state) => {
                    const res = grammar.tokenizeLine(line, state.ruleStack);
                    return {
                        endState: new TokenizerState(res.ruleStack),
                        tokens: res.tokens.map(token => ({
                            ...token,
                            scopes: TMToMonacoToken(editor, token.scopes),
                        })),
                    };
                },
            });
        })
    );
}

const TMToMonacoToken = (editor, scopes) => {
    let scopeName = "";
    for (let i = scopes[0].length - 1; i >= 0; i -= 1) {
        const char = scopes[0][i];
        if (char === ".") break;
        scopeName = char + scopeName;
    }
    for (let i = scopes.length - 1; i >= 0; i -= 1) {
        const scope = scopes[i];
        for (let i = scope.length - 1; i >= 0; i -= 1) {
            const char = scope[i];
            if (char === ".") {
                const token = scope.slice(0, i);
                if (editor._themeService.getTheme()._tokenTheme._match(token + "." + scopeName)._foreground > 1) {
                    return token + "." + scopeName;
                }
                if (editor._themeService.getTheme()._tokenTheme._match(token)._foreground > 1) {
                    return token;
                }
            }
        }
    }
    return "";
};