export class JsxTagsContribution {
    id = 'jsx-tags';

    registerTextmateLanguage(registry) {
        this.registerJsxTags();
    }

    registerJsxTags() {
        monaco.languages.register({
            id: this.id
        });
        monaco.languages.onLanguage(this.id, () => {
            monaco.languages.setLanguageConfiguration(this.id, this.configuration);
        });
    }

    configuration = {
        'comments': {
            'blockComment': ['{/*', '*/}']
        },
        'brackets': [
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
            ['<', '>']
        ],
        'autoClosingPairs': [
            { 'open': '{', 'close': '}' },
            { 'open': '[', 'close': ']' },
            { 'open': '(', 'close': ')' },
            { 'open': '\'', 'close': '\'', 'notIn': ['string', 'comment'] },
            { 'open': '"', 'close': '"', 'notIn': ['string'] },
            { 'open': '/**', 'close': ' */', 'notIn': ['string'] }
        ],
        'surroundingPairs': [
            { 'open': '{', 'close': '}' },
            { 'open': '[', 'close': ']' },
            { 'open': '(', 'close': ')' },
            { 'open': '<', 'close': '>' },
            { 'open': '\'', 'close': '\'' },
            { 'open': '"', 'close': '"' }
        ]
    };
}
