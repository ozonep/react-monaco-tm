// import { loadWASM, OnigScanner, OnigString } from 'onigasm';
//
// export function fetchOnigasm() {
//     return new Promise((resolve, reject) => {
//         const onigasmPath = require('onigasm/lib/onigasm.wasm');
//         const request = new XMLHttpRequest();
//         request.onreadystatechange = function () {
//             if (this.readyState === XMLHttpRequest.DONE) {
//                 if (this.status === 200) {
//                     resolve(this.response);
//                 } else {
//                     reject(new Error('Could not fetch onigasm'));
//                 }
//             }
//         };
//         request.open('GET', onigasmPath, true);
//         request.responseType = 'arraybuffer';
//         request.send();
//     });
// }
//
// export class OnigasmLib {
//     createOnigScanner(sources) {
//         return new OnigScanner(sources);
//     }
//     createOnigString(sources) {
//         return new OnigString(sources);
//     }
// }
//
//
// export const onigasmPromise = fetchOnigasm().then(async (buffer) => {
//     console.log("DONE BROS!");
//     await loadWASM(buffer);
//     return new OnigasmLib();
// });