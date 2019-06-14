"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.renderToHtml = renderToHtml;
function renderToHtml(lines) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var bg = options.bg || '#fff';
    var html = '';
    html += '<pre class="shiki" style="background-color: ' + bg + '">';
    if (options.langId) {
        html += '<div class="language-id">' + options.langId + '</div>';
    }
    html += '<code>';
    lines.forEach(function (l) {
        if (l.length === 0) {
            html += '\n';
        } else {
            l.forEach(function (token) {
                html += '<span style="color: ' + token.color + '">' + escapeHtml(token.content) + '</span>';
            });
            html += '\n';
        }
    });
    html = html.replace(/\n*$/, '');
    html += '</code></pre>';
    return html;
}

function escapeHtml(html) {
    return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}