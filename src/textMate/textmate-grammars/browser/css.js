export class CssContribution {
    id = 'css';
    scopeName = 'source.css';

    registerTextmateLanguage(registry) {
        monaco.languages.register({
            id: this.id,
            extensions: ['.css'],
            aliases: ['CSS', 'css'],
            mimetypes: ['text/css']
        });
        monaco.languages.setLanguageConfiguration(this.id, {
            wordPattern: /(#?-?\d*\.\d\w*%?)|((::|[@#.!:])?[\w-?]+%?)|::|[@#.!:]/g,
            comments: {
                blockComment: ['/*', '*/']
            },
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            autoClosingPairs: [
                { open: '{', close: '}', notIn: ['string', 'comment'] },
                { open: '[', close: ']', notIn: ['string', 'comment'] },
                { open: '(', close: ')', notIn: ['string', 'comment'] },
                { open: '"', close: '"', notIn: ['string', 'comment'] },
                { open: '\'', close: '\'', notIn: ['string', 'comment'] }
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: '\'', close: '\'' }
            ],
            folding: {
                markers: {
                    start: new RegExp('^\\s*\\/\\*\\s*#region\\b\\s*(.*?)\\s*\\*\\/'),
                    end: new RegExp('^\\s*\\/\\*\\s*#endregion\\b.*\\*\\/')
                }
            }
        });
        // const grammar = require('../data/css.json.tmLanguage');
        // registry.registerTextmateGrammarScope(this.scopeName, {
        //     async getGrammarDefinition() {
        //         return {
        //             format: 'json',
        //             content: grammar
        //         };
        //     }
        // });
        registry.mapLanguageIdToTextmateGrammar(this.id, this.scopeName);
    }
}
