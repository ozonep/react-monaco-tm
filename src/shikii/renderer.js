// "use strict";
//
// export function renderToHtml(lines, options = {}) {
//     const bg = options.bg || '#fff';
//     let html = '';
//     html += `<pre class="shiki" style="background-color: ${bg}">`;
//     if (options.langId) {
//         html += `<div class="language-id">${options.langId}</div>`;
//     }
//     html += `<code>`;
//     lines.forEach((l) => {
//         if (l.length === 0) {
//             html += `\n`;
//         }
//         else {
//             l.forEach(token => {
//                 html += `<span style="color: ${token.color}">${escapeHtml(token.content)}</span>`;
//             });
//             html += `\n`;
//         }
//     });
//     html = html.replace(/\n*$/, '');
//     html += `</code></pre>`;
//     return html;
// }
//
// function escapeHtml(html) {
//     return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
// }
