export class PythonContribution {
    id = 'python';
    config = {
        comments: {
            lineComment: '#'
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        autoClosingPairs: [
            { open: '[', close: ']' },
            { open: '{', close: '}' },
            { open: '(', close: ')' },
            { open: '\'', close: '\'', notIn: ['string', 'comment'] },
            { open: '"', close: '"', notIn: ['string'] },
        ],
        surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: '\'', close: '\'' },
        ],
        folding: {
            markers: {
                start: new RegExp('^\\s*#pragma\\s+region\\b'),
                end: new RegExp('^\\s*#pragma\\s+endregion\\b')
            }
        },
        onEnterRules: [
            {
                beforeText: /^\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\s*$/,
                action: { indentAction: monaco.languages.IndentAction.Indent }
            }
        ]
    };

    registerTextmateLanguage(registry) {
        monaco.languages.register({
            id: this.id,
            extensions: ['.py', '.rpy', '.pyw', '.cpy', '.gyp', '.gypi', '.snakefile', '.smk'],
            aliases: ['Python', 'py'],
            firstLine: '^#!\\s*/.*\\bpython[0-9.-]*\\b',
        });

        monaco.languages.setLanguageConfiguration(this.id, this.config);

        const platformGrammar = require('../../data/MagicPython.tmLanguage.json');
        registry.registerTextmateGrammarScope('source.python', {
            async getGrammarDefinition() {
                return {
                    format: 'json',
                    content: platformGrammar
                };
            }
        });

        const cGrammar = require('../data/MagicRegExp.tmLanguage.json');
        registry.registerTextmateGrammarScope('source.regexp.python', {
            async getGrammarDefinition() {
                return {
                    format: 'json',
                    content: cGrammar
                };
            }
        });
        registry.mapLanguageIdToTextmateGrammar(this.id, 'source.python');
    }
}
