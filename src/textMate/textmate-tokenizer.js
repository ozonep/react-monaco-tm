// "use strict";
//
// export class TokenizerState {
//     constructor(ruleStack) {
//         this.ruleStack = ruleStack;
//     }
//     clone() {
//         return new TokenizerState(this.ruleStack);
//     }
//     equals(other) {
//         return other instanceof TokenizerState && (other === this || other.ruleStack === this.ruleStack);
//     }
// }
//
// export const TokenizerOption = {
//     lineLimit: 400
// };
//
// export function createTextmateTokenizer(grammar, options = TokenizerOption) {
//     return {
//         getInitialState: () => new TokenizerState(INITIAL),
//         tokenizeEncoded(line, state) {
//             let processedLine = line;
//             if (options.lineLimit !== undefined && line.length > options.lineLimit) {
//                 processedLine = line.substr(0, options.lineLimit);
//             }
//             const result = grammar.tokenizeLine2(processedLine, state.ruleStack);
//             return {
//                 endState: new TokenizerState(result.ruleStack),
//                 tokens: result.tokens
//             };
//         }
//     };
// }
