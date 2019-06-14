'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getOnigasm = getOnigasm;
var onigasmLib = null;
function getOnigasm() {
    if (!onigasmLib) {
        var onigasmModule = require('onigasm');
        onigasmLib = onigasmModule.loadWASM(require('onigasm/lib/onigasm.wasm')).then(function (_) {
            console.log('HEY');
            return {
                createOnigScanner: function createOnigScanner(patterns) {
                    return new onigasmModule.OnigScanner(patterns);
                },
                createOnigString: function createOnigString(s) {
                    return new onigasmModule.OnigString(s);
                }
            };
        });
    }
    return onigasmLib;
}

// "https://cdn.jsdelivr.net/npm/onigasm@2.2.2/lib/onigasm.wasm"