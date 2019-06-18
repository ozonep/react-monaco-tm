// 'use strict';
// import * as assert from 'assert';
// import { StackElementMetadata } from '../grammar';
// describe('StackElementMetadata', () => {
//     function assertEquals(metadata, languageId, tokenType, fontStyle, foreground, background) {
//         let actual = {
//             languageId: StackElementMetadata.getLanguageId(metadata),
//             tokenType: StackElementMetadata.getTokenType(metadata),
//             fontStyle: StackElementMetadata.getFontStyle(metadata),
//             foreground: StackElementMetadata.getForeground(metadata),
//             background: StackElementMetadata.getBackground(metadata),
//         };
//         let expected = {
//             languageId: languageId,
//             tokenType: tokenType,
//             fontStyle: fontStyle,
//             foreground: foreground,
//             background: background,
//         };
//         assert.deepStrictEqual(actual, expected, 'equals for ' + StackElementMetadata.toBinaryStr(metadata));
//     }
//     it('works', () => {
//         let value = StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
//         assertEquals(value, 1, 4, 4 | 2, 101, 102);
//     });
//     it('can overwrite languageId', () => {
//         let value = StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
//         assertEquals(value, 1, 4, 4 | 2, 101, 102);
//         value = StackElementMetadata.set(value, 2, 0, -1, 0, 0);
//         assertEquals(value, 2, 4, 4 | 2, 101, 102);
//     });
//     it('can overwrite tokenType', () => {
//         let value = StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
//         assertEquals(value, 1, 4, 4 | 2, 101, 102);
//         value = StackElementMetadata.set(value, 0, 1, -1, 0, 0);
//         assertEquals(value, 1, 1, 4 | 2, 101, 102);
//     });
//     it('can overwrite font style', () => {
//         let value = StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
//         assertEquals(value, 1, 4, 4 | 2, 101, 102);
//         value = StackElementMetadata.set(value, 0, 0, 0, 0, 0);
//         assertEquals(value, 1, 4, 0, 101, 102);
//     });
//     it('can overwrite foreground', () => {
//         let value = StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
//         assertEquals(value, 1, 4, 4 | 2, 101, 102);
//         value = StackElementMetadata.set(value, 0, 0, -1, 5, 0);
//         assertEquals(value, 1, 4, 4 | 2, 5, 102);
//     });
//     it('can overwrite background', () => {
//         let value = StackElementMetadata.set(0, 1, 4, 4 | 2, 101, 102);
//         assertEquals(value, 1, 4, 4 | 2, 101, 102);
//         value = StackElementMetadata.set(value, 0, 0, -1, 0, 7);
//         assertEquals(value, 1, 4, 4 | 2, 101, 7);
//     });
//     it('can work at max values', () => {
//         const maxLangId = 255;
//         const maxTokenType = 1 | 0 | 4 | 2;
//         const maxFontStyle = 2 | 1  | 4;
//         const maxForeground = 511;
//         const maxBackground = 511;
//         let value = StackElementMetadata.set(0, maxLangId, maxTokenType, maxFontStyle, maxForeground, maxBackground);
//         assertEquals(value, maxLangId, maxTokenType, maxFontStyle, maxForeground, maxBackground);
//     });
// });
