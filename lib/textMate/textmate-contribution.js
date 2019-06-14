"use strict";
/**
 * Callback for extensions to contribute language grammar definitions
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEncodedLanguageId = getEncodedLanguageId;
function getEncodedLanguageId(languageId) {
  return monaco.languages.getEncodedLanguageId(languageId);
}