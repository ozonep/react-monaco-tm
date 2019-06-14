'use strict';
let onigasmLib = null;
export function getOnigasm() {
    if (!onigasmLib) {
        let onigasmModule = require('onigasm');
        onigasmLib = onigasmModule.loadWASM(require('onigasm/lib/onigasm.wasm')).then((_) => {
            console.log('HEY');
            return {
                createOnigScanner(patterns) { return new onigasmModule.OnigScanner(patterns); },
                createOnigString(s) { return new onigasmModule.OnigString(s); }
            };
        });
    }
    return onigasmLib;
}

// "https://cdn.jsdelivr.net/npm/onigasm@2.2.2/lib/onigasm.wasm"