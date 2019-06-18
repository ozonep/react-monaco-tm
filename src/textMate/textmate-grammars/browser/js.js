// import { getEncodedLanguageId } from '../../textmate/textmate-contribution';
//
// export class JavascriptContribution {
//     js_id = 'javascript';
//     js_react_id = 'javascriptreact';
//
//     registerTextmateLanguage(registry) {
//         this.registerJavaScript();
//         // const grammar = require('../data/javascript.tmlanguage.json');
//         // registry.registerTextmateGrammarScope('source.js', {
//         //     async getGrammarDefinition() {
//         //         return {
//         //             format: 'json',
//         //             content: grammar,
//         //         };
//         //     }
//         // });
//         registry.registerGrammarConfiguration(this.js_id, {
//             embeddedLanguages: {
//                 'meta.tag.js': getEncodedLanguageId('jsx-tags'),
//                 'meta.tag.without-attributes.js': getEncodedLanguageId('jsx-tags'),
//                 'meta.tag.attributes.js.jsx': getEncodedLanguageId('javascriptreact'),
//                 'meta.embedded.expression.js': getEncodedLanguageId('javascriptreact')
//             },
//             tokenTypes: {
//                 'entity.name.type.instance.jsdoc': 0,
//                 'entity.name.function.tagged-template': 0,
//                 'meta.import string.quoted': 0,
//                 'variable.other.jsdoc': 0
//             }
//         });
//
//         registry.mapLanguageIdToTextmateGrammar(this.js_id, 'source.js');
//
//         // const jsxGrammar = require('../data/javascript.jsx.tmlanguage.json');
//         // registry.registerTextmateGrammarScope('source.jsx', {
//         //     async getGrammarDefinition() {
//         //         return {
//         //             format: 'json',
//         //             content: jsxGrammar,
//         //         };
//         //     }
//         // });
//
//         registry.mapLanguageIdToTextmateGrammar(this.js_react_id, 'source.jsx');
//     }
//
//     registerJavaScript() {
//         monaco.languages.register({
//             id: this.js_id,
//             aliases: [
//                 'JavaScript',
//                 'javascript',
//                 'js'
//             ],
//             extensions: [
//                 '.js',
//                 '.es6',
//                 '.mjs',
//                 '.pac'
//             ],
//             filenames: [
//                 'jakefile'
//             ],
//             firstLine: '^#!.*\\bnode',
//             mimetypes: [
//                 'text/javascript'
//             ]
//         });
//
//         monaco.languages.onLanguage(this.js_id, () => {
//             monaco.languages.setLanguageConfiguration(this.js_id, this.configuration);
//         });
//
//         monaco.languages.register({
//             id: this.js_react_id,
//             aliases: [
//                 'JavaScript React',
//                 'jsx'
//             ],
//             extensions: [
//                 '.jsx'
//             ]
//         });
//         monaco.languages.onLanguage(this.js_react_id, () => {
//             monaco.languages.setLanguageConfiguration(this.js_react_id, this.configuration);
//         });
//     }
//
//     configuration = {
//         'comments': {
//             'lineComment': '//',
//             'blockComment': ['/*', '*/']
//         },
//         'brackets': [
//             ['{', '}'],
//             ['[', ']'],
//             ['(', ')']
//         ],
//         'autoClosingPairs': [
//             { 'open': '{', 'close': '}' },
//             { 'open': '[', 'close': ']' },
//             { 'open': '(', 'close': ')' },
//             { 'open': "'", 'close': "'", 'notIn': ['string', 'comment'] },
//             { 'open': '"', 'close': '"', 'notIn': ['string'] },
//             { 'open': '`', 'close': '`', 'notIn': ['string', 'comment'] },
//             { 'open': '/**', 'close': ' */', 'notIn': ['string'] }
//         ],
//         'surroundingPairs': [
//             { 'open': '{', 'close': '}' },
//             { 'open': '[', 'close': ']' },
//             { 'open': '(', 'close': ')' },
//             { 'open': "'", 'close': "'" },
//             { 'open': '"', 'close': '"' },
//             { 'open': '`', 'close': '`' }
//         ],
//         'folding': {
//             'markers': {
//                 'start': new RegExp('^\\s*//\\s*#?region\\b'),
//                 'end': new RegExp('^\\s*//\\s*#?endregion\\b')
//             }
//         }
//     };
// }