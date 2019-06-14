export class TypescriptContribution {
    ts_id = 'typescript';
    ts_react_id = 'typescriptreact';

    registerTextmateLanguage(registry) {
        this.registerTypeScript();
        const grammar = require('../data/typescript.json.tmlanguage');
        registry.registerTextmateGrammarScope('source.ts', {
            async getGrammarDefinition() {
                return {
                    format: 'json',
                    content: grammar,
                };
            }
        });

        registry.mapLanguageIdToTextmateGrammar(this.ts_id, 'source.ts');
        registry.registerGrammarConfiguration(this.ts_id, {
            tokenTypes: {
                'entity.name.type.instance.jsdoc': 0,
                'entity.name.function.tagged-template': 0,
                'meta.import string.quoted': 0,
                'variable.other.jsdoc': 0
            }
        });

        const jsxGrammar = require('../data/typescript.tsx.json.tmlanguage');
        registry.registerTextmateGrammarScope('source.tsx', {
            async getGrammarDefinition() {
                return {
                    format: 'json',
                    content: jsxGrammar,
                };
            }
        });

        registry.mapLanguageIdToTextmateGrammar(this.ts_react_id, 'source.tsx');
    }

    registerTypeScript() {
        monaco.languages.register({
            id: this.ts_id,
            aliases: [
                'TypeScript',
                'typescript',
                'ts'
            ],
            extensions: [
                '.ts'
            ],
            mimetypes: [
                'text/typescript'
            ]
        });

        monaco.languages.onLanguage(this.ts_id, () => {
            monaco.languages.setLanguageConfiguration(this.ts_id, this.configuration);
        });

        monaco.languages.register({
            id: this.ts_react_id,
            aliases: [
                'TypeScript React',
                'tsx'
            ],
            extensions: [
                '.tsx'
            ]
        });
        monaco.languages.onLanguage(this.ts_react_id, () => {
            monaco.languages.setLanguageConfiguration(this.ts_react_id, this.configuration);
        });
    }

    configuration = {
        'comments': {
            'lineComment': '//',
            'blockComment': ['/*', '*/']
        },
        'brackets': [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        'autoClosingPairs': [
            { 'open': '{', 'close': '}' },
            { 'open': '[', 'close': ']' },
            { 'open': '(', 'close': ')' },
            { 'open': "'", 'close': "'", 'notIn': ['string', 'comment'] },
            { 'open': '"', 'close': '"', 'notIn': ['string'] },
            { 'open': '`', 'close': '`', 'notIn': ['string', 'comment'] },
            { 'open': '/**', 'close': ' */', 'notIn': ['string'] }
        ],
        'surroundingPairs': [
            { 'open': '{', 'close': '}' },
            { 'open': '[', 'close': ']' },
            { 'open': '(', 'close': ')' },
            { 'open': "'", 'close': "'" },
            { 'open': '"', 'close': '"' },
            { 'open': '`', 'close': '`' }
        ],
        'folding': {
            'markers': {
                'start': new RegExp('^\\s*//\\s*#?region\\b'),
                'end': new RegExp('^\\s*//\\s*#?endregion\\b')
            }
        }
    };
}
