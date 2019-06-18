// "use strict";
//
// export class StackElementMetadata {
//     static toBinaryStr(metadata) {
//         let r = metadata.toString(2);
//         while (r.length < 32) {
//             r = '0' + r;
//         }
//         return r;
//     }
//     static printMetadata(metadata) {
//         let languageId = StackElementMetadata.getLanguageId(metadata);
//         let tokenType = StackElementMetadata.getTokenType(metadata);
//         let fontStyle = StackElementMetadata.getFontStyle(metadata);
//         let foreground = StackElementMetadata.getForeground(metadata);
//         let background = StackElementMetadata.getBackground(metadata);
//         console.log({
//             languageId: languageId,
//             tokenType: tokenType,
//             fontStyle: fontStyle,
//             foreground: foreground,
//             background: background
//         });
//     }
//     static getLanguageId(metadata) {
//         return (metadata & 255) >>> 0;
//     }
//     static getTokenType(metadata) {
//         return (metadata & 1792) >>> 8;
//     }
//     static getFontStyle(metadata) {
//         return (metadata & 14336) >>> 11;
//     }
//     static getForeground(metadata) {
//         return (metadata & 8372224) >>> 14;
//     }
//     static getBackground(metadata) {
//         return (metadata & 4286578688) >>> 23;
//     }
//     static set(metadata, languageId, tokenType, fontStyle, foreground, background) {
//         let _languageId = StackElementMetadata.getLanguageId(metadata);
//         let _tokenType = StackElementMetadata.getTokenType(metadata);
//         let _fontStyle = StackElementMetadata.getFontStyle(metadata);
//         let _foreground = StackElementMetadata.getForeground(metadata);
//         let _background = StackElementMetadata.getBackground(metadata);
//         if (languageId !== 0) {
//             _languageId = languageId;
//         }
//         if (tokenType !== 0) {
//             _tokenType =
//                 tokenType === 8 ? 0 : tokenType;
//         }
//         if (fontStyle !== -1) {
//             _fontStyle = fontStyle;
//         }
//         if (foreground !== 0) {
//             _foreground = foreground;
//         }
//         if (background !== 0) {
//             _background = background;
//         }
//         return (((_languageId << 0) |
//             (_tokenType << 8) |
//             (_fontStyle << 11) |
//             (_foreground << 14) |
//             (_background << 23)) >>>
//             0);
//     }
// }