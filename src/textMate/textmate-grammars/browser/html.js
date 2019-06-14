const EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];

export class HtmlContribution {
    id = 'html';
    scopeName = 'text.html.basic';

    registerTextmateLanguage(registry) {
        monaco.languages.register({
            id: this.id,
            extensions: ['.html', '.htm', '.shtml', '.xhtml', '.mdoc', '.jsp', '.asp', '.aspx', '.jshtm'],
            aliases: ['HTML', 'htm', 'html', 'xhtml'],
            mimetypes: ['text/html', 'text/x-jshtm', 'text/template', 'text/ng-template'],
        });
        monaco.languages.setLanguageConfiguration(this.id, {
            wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
            comments: {
                blockComment: ['<!--', '-->']
            },
            brackets: [
                ['<!--', '-->'],
                ['<', '>'],
                ['{', '}'],
                ['(', ')']
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: '\'', close: '\'' }
            ],

            surroundingPairs: [
                { open: '"', close: '"' },
                { open: '\'', close: '\'' },
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '<', close: '>' },
            ],
            onEnterRules: [
                {
                    beforeText: new RegExp(`<(?!(?:${EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                    afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                    action: { indentAction: monaco.languages.IndentAction.IndentOutdent }
                },
                {
                    beforeText: new RegExp(`<(?!(?:${EMPTY_ELEMENTS.join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                    action: { indentAction: monaco.languages.IndentAction.Indent }
                }
            ],
            folding: {
                markers: {
                    start: new RegExp('^\\s*<!--\\s*#region\\b.*-->'),
                    end: new RegExp('^\\s*<!--\\s*#endregion\\b.*-->')
                }
            }
        });

        const grammar = require('../data/html.json.tmLanguage');
        registry.registerTextmateGrammarScope(this.scopeName, {
            async getGrammarDefinition() {
                return {
                    format: 'json',
                    content: grammar
                };
            }
        });
        registry.mapLanguageIdToTextmateGrammar(this.id, this.scopeName);
    }
}