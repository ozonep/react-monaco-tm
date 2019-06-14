'use strict';
let onigasmLib = null;
export function getOnigasm() {
    if (!onigasmLib) {
        let onigasmModule = require('onigasm');
        onigasmLib = onigasmModule.loadWASM(require('onigasm/lib/onigasm.wasm')).then((_) => {
            return {
                createOnigScanner(patterns) { return new onigasmModule.OnigScanner(patterns); },
                createOnigString(s) { return new onigasmModule.OnigString(s); }
            };
        });
    }
    return onigasmLib;
}