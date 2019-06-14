'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JsxTagsContribution = exports.JsxTagsContribution = function () {
    function JsxTagsContribution() {
        _classCallCheck(this, JsxTagsContribution);

        this.id = 'jsx-tags';
        this.configuration = {
            'comments': {
                'blockComment': ['{/*', '*/}']
            },
            'brackets': [['{', '}'], ['[', ']'], ['(', ')'], ['<', '>']],
            'autoClosingPairs': [{ 'open': '{', 'close': '}' }, { 'open': '[', 'close': ']' }, { 'open': '(', 'close': ')' }, { 'open': '\'', 'close': '\'', 'notIn': ['string', 'comment'] }, { 'open': '"', 'close': '"', 'notIn': ['string'] }, { 'open': '/**', 'close': ' */', 'notIn': ['string'] }],
            'surroundingPairs': [{ 'open': '{', 'close': '}' }, { 'open': '[', 'close': ']' }, { 'open': '(', 'close': ')' }, { 'open': '<', 'close': '>' }, { 'open': '\'', 'close': '\'' }, { 'open': '"', 'close': '"' }]
        };
    }

    _createClass(JsxTagsContribution, [{
        key: 'registerTextmateLanguage',
        value: function registerTextmateLanguage(registry) {
            this.registerJsxTags();
        }
    }, {
        key: 'registerJsxTags',
        value: function registerJsxTags() {
            var _this = this;

            monaco.languages.register({
                id: this.id
            });
            monaco.languages.onLanguage(this.id, function () {
                monaco.languages.setLanguageConfiguration(_this.id, _this.configuration);
            });
        }
    }]);

    return JsxTagsContribution;
}();